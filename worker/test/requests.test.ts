// Port of api/tests/test_requests.py + test_uploads.py, plus admin/feedback.
import { beforeEach, describe, expect, it } from "vitest";
import { type Client, PNG_1PX, SAMPLE_REQUEST, register, setup } from "./helpers";

let t: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => {
  t = await setup();
});

async function userClient(email: string): Promise<Client> {
  const c = t.client();
  await register(c, email, email.split("@")[0]);
  return c;
}

async function createRequest(c: Client, overrides: Record<string, unknown> = {}) {
  const r = await c.post("/api/requests", { ...SAMPLE_REQUEST, ...overrides });
  expect(r.status).toBe(201);
  return (await r.json()) as { id: number } & Record<string, unknown>;
}

function upload(c: Client, id: number, bytes: Uint8Array, name = "s.png") {
  const form = new FormData();
  form.append("file", new File([bytes], name, { type: "image/png" }));
  return c.fetch(`/api/requests/${id}/screenshot`, { method: "POST", body: form });
}

describe("requests", () => {
  it("create requires auth", async () => {
    expect((await t.client().post("/api/requests", SAMPLE_REQUEST)).status).toBe(401);
  });

  it("creates and gets a request", async () => {
    const owner = await userClient("owner@example.com");
    const created = await createRequest(owner);
    expect(created).toMatchObject({ app_name: "My App", enrolled_count: 0, is_owner: true, status: "open" });
    const r = await t.client().get(`/api/requests/${created.id}`);
    expect(r.status).toBe(200);
    expect(await r.json()).toMatchObject({ id: created.id, is_owner: false });
  });

  it("validates input", async () => {
    const owner = await userClient("owner@example.com");
    expect((await owner.post("/api/requests", { ...SAMPLE_REQUEST, tester_count: 0 })).status).toBe(422);
    expect((await owner.post("/api/requests", { ...SAMPLE_REQUEST, play_store_url: "ftp://x" })).status).toBe(422);
    expect((await t.client().get("/api/requests/abc")).status).toBe(422);
    expect((await t.client().get("/api/requests?limit=500")).status).toBe(422);
    expect((await t.client().get("/api/requests/999")).status).toBe(404);
  });

  it("lists with filters (anonymous allowed)", async () => {
    const owner = await userClient("owner@example.com");
    await createRequest(owner, { category: "Games" });
    await createRequest(owner, { category: "Productivity" });
    const all = (await (await t.client().get("/api/requests")).json()) as unknown[];
    expect(all).toHaveLength(2);
    const games = (await (await t.client().get("/api/requests?category=Games")).json()) as { category: string }[];
    expect(games.map((g) => g.category)).toEqual(["Games"]);
  });

  it("owner cannot enroll in own request", async () => {
    const owner = await userClient("owner@example.com");
    const req = await createRequest(owner);
    expect((await owner.post(`/api/requests/${req.id}/enroll`)).status).toBe(400);
  });

  it("enrolls and unenrolls", async () => {
    const owner = await userClient("owner@example.com");
    const tester = await userClient("tester@example.com");
    const req = await createRequest(owner);

    expect((await tester.post(`/api/requests/${req.id}/enroll`)).status).toBe(201);
    expect((await tester.post(`/api/requests/${req.id}/enroll`)).status).toBe(409);
    const got = await (await tester.get(`/api/requests/${req.id}`)).json();
    expect(got).toMatchObject({ enrolled_count: 1, is_enrolled: true });
    const listed = (await (await tester.get("/api/requests")).json()) as Record<string, unknown>[];
    expect(listed[0]).toMatchObject({ enrolled_count: 1, is_enrolled: true });

    expect((await tester.del(`/api/requests/${req.id}/enroll`)).status).toBe(204);
    expect((await tester.del(`/api/requests/${req.id}/enroll`)).status).toBe(404);
  });

  it("enforces the enrollment cap and has_open_slots", async () => {
    const owner = await userClient("owner@example.com");
    const req = await createRequest(owner, { tester_count: 1 });
    const a = await userClient("a@example.com");
    const b = await userClient("b@example.com");
    expect((await a.post(`/api/requests/${req.id}/enroll`)).status).toBe(201);
    const full = await b.post(`/api/requests/${req.id}/enroll`);
    expect(full.status).toBe(409);
    expect(await full.json()).toEqual({ detail: "Request is full" });
    const open = (await (await t.client().get("/api/requests?has_open_slots=true")).json()) as unknown[];
    expect(open).toHaveLength(0);
  });

  it("never over-fills the last slot under concurrent enrollments", async () => {
    const owner = await userClient("owner@example.com");
    const req = await createRequest(owner, { tester_count: 1 });
    const testers = await Promise.all(["a", "b", "c", "d"].map((n) => userClient(`${n}@example.com`)));
    const statuses = (await Promise.all(testers.map((c) => c.post(`/api/requests/${req.id}/enroll`)))).map(
      (r) => r.status,
    );
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(3);
    const got = await (await t.client().get(`/api/requests/${req.id}`)).json();
    expect(got).toMatchObject({ enrolled_count: 1 });
  });

  it("lists 100 requests (more than one D1 parameter chunk)", async () => {
    const owner = await userClient("owner@example.com");
    const tester = await userClient("tester@example.com");
    await t.db.batch(
      Array.from({ length: 100 }, (_, i) =>
        t.db
          .prepare(
            `INSERT INTO test_requests (owner_id, app_name, play_store_url, category, description,
               tester_count, duration_days, location, created_at)
             SELECT id, ?, 'https://play.google.com/x', 'Games', 'd', 5, 7, 'UK', ? FROM users WHERE email = ?`,
          )
          .bind(`App ${i}`, Date.now() - i * 1000, "owner@example.com"),
      ),
    );
    // enroll in the oldest one, which lands in the second chunk
    const ids = (await (await tester.get("/api/requests?limit=100")).json()) as { id: number }[];
    expect(ids).toHaveLength(100);
    const last = ids[99].id;
    expect((await tester.post(`/api/requests/${last}/enroll`)).status).toBe(201);
    const listed = (await (await tester.get("/api/requests?limit=100")).json()) as Record<string, unknown>[];
    expect(listed[99]).toMatchObject({ id: last, enrolled_count: 1, is_enrolled: true });
    expect(listed.filter((r) => r.is_enrolled)).toHaveLength(1);
  });

  it("enrollments list is owner-only", async () => {
    const owner = await userClient("owner@example.com");
    const tester = await userClient("tester@example.com");
    const req = await createRequest(owner);
    await tester.post(`/api/requests/${req.id}/enroll`);
    expect((await tester.get(`/api/requests/${req.id}/enrollments`)).status).toBe(403);
    const rows = (await (await owner.get(`/api/requests/${req.id}/enrollments`)).json()) as Record<string, unknown>[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ tester_email: "tester@example.com", tester_name: "tester" });
  });
});

describe("uploads", () => {
  it("owner uploads a screenshot, served from /uploads with security headers", async () => {
    const owner = await userClient("owner@example.com");
    const req = await createRequest(owner);
    const r = await upload(owner, req.id, PNG_1PX);
    expect(r.status).toBe(200);
    const path = ((await r.json()) as { screenshot_path: string }).screenshot_path;
    expect(path).toMatch(/^\/uploads\/[A-Za-z0-9_-]+\.png$/);

    const img = await t.client().get(path);
    expect(img.status).toBe(200);
    expect(img.headers.get("content-type")).toBe("image/png");
    expect(img.headers.get("x-content-type-options")).toBe("nosniff");
    expect(new Uint8Array(await img.arrayBuffer())).toEqual(PNG_1PX);
  });

  it("rejects non-images and non-owners", async () => {
    const owner = await userClient("owner@example.com");
    const other = await userClient("other@example.com");
    const req = await createRequest(owner);
    expect((await upload(owner, req.id, new TextEncoder().encode("not an image"))).status).toBe(400);
    expect((await upload(other, req.id, PNG_1PX)).status).toBe(403);
  });

  it("rejects oversized files with 413", async () => {
    const owner = await userClient("owner@example.com");
    const req = await createRequest(owner);
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    big.set(PNG_1PX);
    expect((await upload(owner, req.id, big)).status).toBe(413);
  });

  it("404s for missing and malformed upload keys", async () => {
    expect((await t.client().get("/uploads/missing.png")).status).toBe(404);
    expect((await t.client().get("/uploads/../etc/passwd")).status).toBe(404);
  });
});

describe("feedback + admin", () => {
  it("submits feedback", async () => {
    const c = await userClient("u@example.com");
    expect((await c.post("/api/feedback", { kind: "bug", message: "it broke" })).status).toBe(201);
    expect((await c.post("/api/feedback", { kind: "nope", message: "it broke" })).status).toBe(422);
    expect((await t.client().post("/api/feedback", { kind: "bug", message: "it broke" })).status).toBe(401);
  });

  it("admin endpoints require admin; stats and CSVs work", async () => {
    const adminC = await userClient("admin@example.com");
    const tester = await userClient("tester@example.com");
    expect((await adminC.get("/api/admin/stats")).status).toBe(403);
    await t.db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?").bind("admin@example.com").run();

    const req = await createRequest(adminC, { description: 'has "quotes", commas\nand newlines' });
    await tester.post(`/api/requests/${req.id}/enroll`);
    await tester.post("/api/feedback", { kind: "bug", message: "it broke" });

    const stats = (await (await adminC.get("/api/admin/stats?days=7")).json()) as {
      totals: Record<string, number>;
      by_day: { users: { date: string; count: number }[] };
    };
    expect(stats.totals).toEqual({ users: 2, requests: 1, enrollments: 1, feedback: 1 });
    expect(stats.by_day.users).toHaveLength(7);
    expect(stats.by_day.users.at(-1)).toEqual({ date: new Date().toISOString().slice(0, 10), count: 2 });

    const csv = await adminC.get("/api/admin/export/requests.csv");
    expect(csv.headers.get("content-disposition")).toMatch(/attachment; filename="requests-\d{8}-\d{6}\.csv"/);
    const text = await csv.text();
    expect(text).toContain('"has ""quotes"", commas\nand newlines"');
    expect(text).toContain("tester@example.com");
    expect(await (await adminC.get("/api/admin/export/users.csv")).text()).toMatch(/admin@example\.com,True,1,0/);
    expect(await (await adminC.get("/api/admin/export/feedback.csv")).text()).toContain("it broke");
  });
});
