// Port of api/app/core/deps.py.
import { eq } from "drizzle-orm";
import type { Context, MiddlewareHandler } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { users, type User } from "../db/schema";
import type { AppEnv } from "../env";
import { ApiError } from "./errors";
import { createAccessToken, decodeAccessToken } from "./security";

export const COOKIE_NAME = "betapod_session";

export const expireDays = (c: Context<AppEnv>) => Number(c.env.API_JWT_EXPIRE_DAYS ?? "7");

async function resolveUser(c: Context<AppEnv>): Promise<{ user: User | null; reason?: string }> {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return { user: null, reason: "Not authenticated" };
  const userId = await decodeAccessToken(token, c.env.API_SECRET_KEY);
  if (userId === null) return { user: null, reason: "Invalid session" };
  const [user] = await c.var.db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ? { user } : { user: null, reason: "User not found" };
}

export const currentUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  const { user, reason } = await resolveUser(c);
  if (!user) throw new ApiError(401, reason);
  c.set("user", user);
  await next();
};

export const optionalUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set("user", (await resolveUser(c)).user);
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.var.user?.isAdmin) throw new ApiError(403, "Admin only");
  await next();
};

/** The authenticated user; only call after `currentUser`. */
export const authed = (c: Context<AppEnv>): User => c.var.user as User;

const cookieDomain = (c: Context<AppEnv>) => c.env.API_COOKIE_DOMAIN || undefined;

export async function setSessionCookie(c: Context<AppEnv>, userId: number): Promise<void> {
  const token = await createAccessToken(userId, c.env.API_SECRET_KEY, expireDays(c));
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: c.env.API_COOKIE_SECURE !== "false",
    sameSite: "Lax",
    maxAge: expireDays(c) * 24 * 3600,
    domain: cookieDomain(c),
    path: "/",
  });
}

export function clearSessionCookie(c: Context<AppEnv>): void {
  deleteCookie(c, COOKIE_NAME, { domain: cookieDomain(c), path: "/" });
}

export function clientIp(c: Context<AppEnv>): string {
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
