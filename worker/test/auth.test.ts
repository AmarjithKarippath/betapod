// Port of api/tests/test_auth.py + test_health.py.
import { beforeEach, describe, expect, it } from "vitest";
import { register, setup } from "./helpers";

let t: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => {
  t = await setup();
});

describe("health", () => {
  it("responds with db status and security headers", async () => {
    const r = await t.client().get("/api/health");
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ status: "ok", db: true });
    expect(r.headers.get("x-frame-options")).toBe("DENY");
  });

  it("returns JSON 404 for unknown api routes", async () => {
    const r = await t.client().get("/api/nope");
    expect(r.status).toBe(404);
    expect(await r.json()).toEqual({ detail: "Not Found" });
  });
});

describe("auth", () => {
  it("register sets session cookie", async () => {
    const c = t.client();
    const r = await register(c);
    expect(r.status).toBe(201);
    const body = (await r.json()) as Record<string, unknown>;
    expect(body).toMatchObject({ email: "alice@example.com", name: "Alice", is_admin: false });
    expect(c.cookies.has("betapod_session")).toBe(true);
    const sc = r.headers.getSetCookie()[0];
    expect(sc).toMatch(/HttpOnly/);
    expect(sc).toMatch(/SameSite=Lax/);
  });

  it("rejects duplicate email", async () => {
    await register(t.client());
    expect((await register(t.client())).status).toBe(400);
  });

  it("normalizes email", async () => {
    const r = await register(t.client(), "Alice@Example.COM");
    expect(r.status).toBe(201);
    expect(((await r.json()) as { email: string }).email).toBe("alice@example.com");
  });

  it("rejects weak password with 422 detail list", async () => {
    const r = await register(t.client(), "a@example.com", "A", "short");
    expect(r.status).toBe(422);
    const body = (await r.json()) as { detail: { loc: string[] }[] };
    expect(body.detail[0].loc).toEqual(["body", "password"]);
  });

  it("logs in", async () => {
    await register(t.client());
    const c = t.client();
    const r = await c.post("/api/auth/login", { email: "alice@example.com", password: "hunter2hunter" });
    expect(r.status).toBe(200);
    expect(c.cookies.has("betapod_session")).toBe(true);
  });

  it("gives the same generic error for wrong password and unknown email", async () => {
    await register(t.client());
    for (const creds of [
      { email: "alice@example.com", password: "wrongwrong1" },
      { email: "nobody@example.com", password: "whatever1" },
    ]) {
      const r = await t.client().post("/api/auth/login", creds);
      expect(r.status).toBe(401);
      expect(await r.json()).toEqual({ detail: "Invalid email or password" });
    }
  });

  it("me requires auth and returns the current user", async () => {
    const c = t.client();
    expect((await c.get("/api/auth/me")).status).toBe(401);
    await register(c);
    const r = await c.get("/api/auth/me");
    expect(r.status).toBe(200);
    expect(((await r.json()) as { email: string }).email).toBe("alice@example.com");
  });

  it("rejects a tampered session cookie", async () => {
    const c = t.client();
    c.cookies.set("betapod_session", "garbage");
    const r = await c.get("/api/auth/me");
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ detail: "Invalid session" });
  });

  it("logout clears the session", async () => {
    const c = t.client();
    await register(c);
    expect((await c.post("/api/auth/logout")).status).toBe(204);
    expect(c.cookies.has("betapod_session")).toBe(false);
    expect((await c.get("/api/auth/me")).status).toBe(401);
  });

  it("login rate limit trips with 429", async () => {
    await register(t.client());
    const statuses = [];
    for (let i = 0; i < 7; i++) {
      const r = await t.client().post("/api/auth/login", { email: "alice@example.com", password: "wrongwrong1" });
      statuses.push(r.status);
    }
    expect(statuses).toContain(429);
  });
});
