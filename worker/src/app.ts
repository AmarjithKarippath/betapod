// Port of api/app/main.py. Mounted under /api by the Worker entry point, so
// routes here are identical to the FastAPI ones.
import { sql } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { DbHandle } from "./db/client";
import type { AppEnv, Env } from "./env";
import { ApiError } from "./lib/errors";
import { admin } from "./routes/admin";
import { auth } from "./routes/auth";
import { feedback } from "./routes/feedback";
import { requests } from "./routes/requests";
import { uploads } from "./routes/uploads";

// From api/app/core/middleware.py.
const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
};

export function createApp(openDb: (env: Env) => DbHandle) {
  const api = new Hono<AppEnv>();

  api.use("*", (c, next) =>
    cors({
      origin: (c.env.API_CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean),
      credentials: true,
      allowMethods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      maxAge: 3600,
    })(c, next),
  );

  api.use("*", async (c, next) => {
    const handle = openDb(c.env);
    c.set("db", handle.db);
    c.set("user", null);
    try {
      await next();
    } finally {
      const done = handle.close().catch(() => {});
      try {
        c.executionCtx.waitUntil(done);
      } catch {
        await done; // no ExecutionContext (tests)
      }
    }
  });

  api.get("/health", async (c) => {
    let db = false;
    try {
      await c.var.db.run(sql`select 1`);
      db = true;
    } catch (e) {
      console.error("health: db check failed", e);
    }
    return c.json({ status: "ok", db });
  });

  api.route("/auth", auth);
  api.route("/requests", requests);
  api.route("/feedback", feedback);
  api.route("/admin", admin);

  const app = new Hono<AppEnv>();
  app.use("*", async (c, next) => {
    await next();
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
      if (!c.res.headers.has(k)) c.res.headers.set(k, v);
    }
  });
  app.onError((err, c) => {
    if (err instanceof ApiError) {
      return c.json({ detail: err.detail }, err.status as 400);
    }
    console.error("unhandled error", err);
    return c.json({ detail: "Internal Server Error" }, 500);
  });
  // Only /api/* and /uploads/* reach the Worker (run_worker_first).
  app.notFound((c) => c.json({ detail: "Not Found" }, 404));
  app.route("/api", api);
  app.route("/uploads", uploads);
  return app;
}
