// Port of api/app/routers/requests.py. The 30s Redis cache for anonymous
// list requests is intentionally dropped (D1 reads are cheap and local).
import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { enrollments, testRequests, users, type TestRequest, type User } from "../db/schema";
import type { AppEnv, Db } from "../env";
import { authed, currentUser, optionalUser } from "../lib/auth";
import { ApiError, isUniqueViolation } from "../lib/errors";
import { rateLimit } from "../lib/ratelimit";
import { saveScreenshot } from "../lib/uploads";
import { parseId, parseJson, parseQuery } from "../lib/validate";
import { ListQuery, RequestCreate, requestOut } from "../schemas";

export const requests = new Hono<AppEnv>();

// D1 allows at most 100 bound parameters per statement; `limit` can be 100.
const PARAM_CHUNK = 90;
function chunks<T>(xs: T[], size = PARAM_CHUNK): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < xs.length; i += size) out.push(xs.slice(i, i + size));
  return out;
}

async function enrolledCount(db: Db, requestId: number): Promise<number> {
  const [row] = await db.select({ n: count() }).from(enrollments).where(eq(enrollments.requestId, requestId));
  return row?.n ?? 0;
}

async function isEnrolled(db: Db, requestId: number, user: User | null): Promise<boolean> {
  if (!user) return false;
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.requestId, requestId), eq(enrollments.testerId, user.id)))
    .limit(1);
  return !!row;
}

async function serialize(db: Db, req: TestRequest, user: User | null) {
  return requestOut(req, {
    enrolledCount: await enrolledCount(db, req.id),
    isEnrolled: await isEnrolled(db, req.id, user),
    isOwner: !!user && req.ownerId === user.id,
  });
}

async function getRequestOr404(db: Db, id: number): Promise<TestRequest> {
  const [req] = await db.select().from(testRequests).where(eq(testRequests.id, id)).limit(1);
  if (!req) throw new ApiError(404, "Request not found");
  return req;
}

requests.post("/", currentUser, async (c) => {
  const user = authed(c);
  const payload = await parseJson(c, RequestCreate);
  await rateLimit(c, `create_request:user:${user.id}`, 10, 3600);
  const [req] = await c.var.db
    .insert(testRequests)
    .values({
      ownerId: user.id,
      appName: payload.app_name.trim(),
      playStoreUrl: payload.play_store_url,
      category: payload.category.trim(),
      description: payload.description.trim(),
      testerCount: payload.tester_count,
      durationDays: payload.duration_days,
      location: payload.location.trim(),
    })
    .returning();
  return c.json(requestOut(req, { enrolledCount: 0, isEnrolled: false, isOwner: true }), 201);
});

requests.get("/", optionalUser, async (c) => {
  const q = parseQuery(c, ListQuery);
  const user = c.var.user;
  const db = c.var.db;

  const filters: SQL[] = [];
  if (q.category) filters.push(eq(testRequests.category, q.category));
  if (q.location) filters.push(eq(testRequests.location, q.location));

  const rows = await db
    .select()
    .from(testRequests)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(testRequests.createdAt))
    .limit(q.limit)
    .offset(q.offset);
  if (rows.length === 0) return c.json([]);

  const counts = new Map<number, number>();
  const mine = new Set<number>();
  for (const ids of chunks(rows.map((r) => r.id))) {
    const countRows = await db
      .select({ requestId: enrollments.requestId, n: count() })
      .from(enrollments)
      .where(inArray(enrollments.requestId, ids))
      .groupBy(enrollments.requestId);
    for (const r of countRows) counts.set(r.requestId, r.n);
    if (user) {
      const own = await db
        .select({ requestId: enrollments.requestId })
        .from(enrollments)
        .where(and(inArray(enrollments.requestId, ids), eq(enrollments.testerId, user.id)));
      for (const r of own) mine.add(r.requestId);
    }
  }

  const out = [];
  for (const r of rows) {
    const enrolled = counts.get(r.id) ?? 0;
    if (q.has_open_slots && enrolled >= r.testerCount) continue;
    out.push(
      requestOut(r, { enrolledCount: enrolled, isEnrolled: mine.has(r.id), isOwner: !!user && r.ownerId === user.id }),
    );
  }
  return c.json(out);
});

requests.get("/:request_id", optionalUser, async (c) => {
  const req = await getRequestOr404(c.var.db, parseId(c));
  return c.json(await serialize(c.var.db, req, c.var.user));
});

requests.post("/:request_id/enroll", currentUser, async (c) => {
  const user = authed(c);
  const requestId = parseId(c);
  await rateLimit(c, `enroll:user:${user.id}`, 30, 3600);

  const req = await getRequestOr404(c.var.db, requestId);
  if (req.ownerId === user.id) throw new ApiError(400, "Owners cannot enroll in their own request");

  // D1 has no row locks or interactive transactions, so the capacity check
  // and the insert are one statement. D1 runs a database's statements
  // serially, which makes this race-free: two testers can't both take the
  // last slot.
  let inserted: number;
  try {
    const result = await c.var.db.run(sql`
      INSERT INTO enrollments (request_id, tester_id)
      SELECT ${req.id}, ${user.id}
      WHERE (SELECT count(*) FROM enrollments WHERE request_id = ${req.id})
          < (SELECT tester_count FROM test_requests WHERE id = ${req.id})`);
    inserted = result.meta.changes;
  } catch (e) {
    if (isUniqueViolation(e)) throw new ApiError(409, "Already enrolled");
    throw e;
  }
  if (inserted === 0) throw new ApiError(409, "Request is full");
  return c.json({ ok: true }, 201);
});

requests.delete("/:request_id/enroll", currentUser, async (c) => {
  const deleted = await c.var.db
    .delete(enrollments)
    .where(and(eq(enrollments.requestId, parseId(c)), eq(enrollments.testerId, authed(c).id)))
    .returning({ id: enrollments.id });
  if (deleted.length === 0) throw new ApiError(404, "Not enrolled");
  return c.body(null, 204);
});

requests.post("/:request_id/screenshot", currentUser, async (c) => {
  const user = authed(c);
  const req = await getRequestOr404(c.var.db, parseId(c));
  if (req.ownerId !== user.id) throw new ApiError(403, "Only the owner can upload a screenshot");

  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    throw new ApiError(422, [{ loc: ["body", "file"], msg: "Field required", type: "missing" }]);
  }
  const path = await saveScreenshot(c.env, file);
  const [updated] = await c.var.db
    .update(testRequests)
    .set({ screenshotPath: path })
    .where(eq(testRequests.id, req.id))
    .returning();
  return c.json(await serialize(c.var.db, updated, user));
});

requests.get("/:request_id/enrollments", currentUser, async (c) => {
  const req = await getRequestOr404(c.var.db, parseId(c));
  if (req.ownerId !== authed(c).id) throw new ApiError(403, "Only the request owner can view enrollments");
  const rows = await c.var.db
    .select({
      id: enrollments.id,
      tester_id: users.id,
      tester_email: users.email,
      tester_name: users.name,
      created_at: enrollments.createdAt,
    })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.testerId))
    .where(eq(enrollments.requestId, req.id))
    .orderBy(asc(enrollments.createdAt));
  return c.json(rows.map((r) => ({ ...r, created_at: r.created_at.toISOString() })));
});
