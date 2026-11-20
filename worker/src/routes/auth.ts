// Port of api/app/routers/auth.py.
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { users } from "../db/schema";
import type { AppEnv } from "../env";
import { authed, clearSessionCookie, clientIp, currentUser, setSessionCookie } from "../lib/auth";
import { ApiError } from "../lib/errors";
import { rateLimit } from "../lib/ratelimit";
import { hashPassword, verifyPassword } from "../lib/security";
import { parseJson } from "../lib/validate";
import { LoginIn, RegisterIn, userOut } from "../schemas";

const INVALID_CREDS = "Invalid email or password";

export const auth = new Hono<AppEnv>();

auth.post("/register", async (c) => {
  const payload = await parseJson(c, RegisterIn);
  await rateLimit(c, `register:ip:${clientIp(c)}`, 5, 900);
  const email = payload.email.toLowerCase().trim();
  await rateLimit(c, `register:email:${email}`, 3, 3600);

  const [existing] = await c.var.db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    // Generic-ish: don't say "email taken" to avoid enumeration.
    throw new ApiError(400, "Could not create account with the provided details.");
  }

  const [user] = await c.var.db
    .insert(users)
    .values({ email, name: payload.name.trim(), passwordHash: await hashPassword(payload.password) })
    .returning();
  await setSessionCookie(c, user.id);
  return c.json(userOut(user), 201);
});

auth.post("/login", async (c) => {
  const payload = await parseJson(c, LoginIn);
  const email = payload.email.toLowerCase().trim();
  await rateLimit(c, `login:ip:${clientIp(c)}`, 10, 900);
  await rateLimit(c, `login:email:${email}`, 5, 900);

  const [user] = await c.var.db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
    throw new ApiError(401, INVALID_CREDS);
  }
  await setSessionCookie(c, user.id);
  return c.json(userOut(user));
});

auth.post("/logout", (c) => {
  clearSessionCookie(c);
  return c.body(null, 204);
});

auth.get("/me", currentUser, (c) => c.json(userOut(authed(c))));
