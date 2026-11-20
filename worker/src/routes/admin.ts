// Port of api/app/routers/admin.py.
import { asc, count, desc, eq, gte, sql, type AnyColumn } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { Hono } from "hono";
import { enrollments, feedback, testRequests, users } from "../db/schema";
import type { AppEnv, Db } from "../env";
import { currentUser, requireAdmin } from "../lib/auth";
import { csvResponse, toCsv } from "../lib/csv";
import { parseQuery } from "../lib/validate";
import { StatsQuery } from "../schemas";

export const admin = new Hono<AppEnv>();
admin.use("*", currentUser, requireAdmin);

const DAY_MS = 86_400_000;
const utcDay = (d: Date) => d.toISOString().slice(0, 10);

async function perDay(db: Db, table: SQLiteTable, createdAt: AnyColumn, sinceDay: string) {
  // created_at is epoch milliseconds; strftime(..., 'unixepoch') is UTC.
  const day = sql<string>`strftime('%Y-%m-%d', ${createdAt} / 1000, 'unixepoch')`;
  const rows = await db
    .select({ day, n: count() })
    .from(table)
    .where(gte(day, sinceDay))
    .groupBy(day);
  return new Map(rows.map((r) => [r.day, Number(r.n)]));
}

function series(byDay: Map<string, number>, days: number) {
  const today = Date.now();
  return Array.from({ length: days }, (_, i) => {
    const date = utcDay(new Date(today - (days - 1 - i) * DAY_MS));
    return { date, count: byDay.get(date) ?? 0 };
  });
}

async function total(db: Db, table: SQLiteTable): Promise<number> {
  const [row] = await db.select({ n: count() }).from(table);
  return Number(row?.n ?? 0);
}

admin.get("/stats", async (c) => {
  const db = c.var.db;
  const days = Math.max(1, Math.min(parseQuery(c, StatsQuery).days, 365));
  const since = utcDay(new Date(Date.now() - (days - 1) * DAY_MS));
  const [u, r, e] = await Promise.all([
    perDay(db, users, users.createdAt, since),
    perDay(db, testRequests, testRequests.createdAt, since),
    perDay(db, enrollments, enrollments.createdAt, since),
  ]);
  return c.json({
    totals: {
      users: await total(db, users),
      requests: await total(db, testRequests),
      enrollments: await total(db, enrollments),
      feedback: await total(db, feedback),
    },
    by_day: { users: series(u, days), requests: series(r, days), enrollments: series(e, days) },
  });
});

admin.get("/export/requests.csv", async (c) => {
  const db = c.var.db;
  const reqs = await db
    .select({ r: testRequests, ownerName: users.name, ownerEmail: users.email })
    .from(testRequests)
    .leftJoin(users, eq(users.id, testRequests.ownerId))
    .orderBy(desc(testRequests.createdAt));
  const enr = await db
    .select({ requestId: enrollments.requestId, email: users.email })
    .from(enrollments)
    .innerJoin(users, eq(users.id, enrollments.testerId))
    .orderBy(asc(enrollments.createdAt));
  const emailsByReq = new Map<number, string[]>();
  for (const { requestId, email } of enr) {
    emailsByReq.set(requestId, [...(emailsByReq.get(requestId) ?? []), email]);
  }

  const body = toCsv(
    ["request_id", "created_at", "app_name", "category", "location", "play_store_url", "tester_count",
      "duration_days", "status", "description", "owner_name", "owner_email", "enrolled_count", "enrolled_emails"],
    reqs.map(({ r, ownerName, ownerEmail }) => {
      const emails = emailsByReq.get(r.id) ?? [];
      return [r.id, r.createdAt.toISOString(), r.appName, r.category, r.location, r.playStoreUrl, r.testerCount,
        r.durationDays, r.status, r.description, ownerName ?? "", ownerEmail ?? "", emails.length, emails.join("; ")];
    }),
  );
  return csvResponse("requests", body);
});

admin.get("/export/feedback.csv", async (c) => {
  const rows = await c.var.db
    .select({ fb: feedback, name: users.name, email: users.email })
    .from(feedback)
    .leftJoin(users, eq(users.id, feedback.userId))
    .orderBy(desc(feedback.createdAt));
  const body = toCsv(
    ["feedback_id", "created_at", "kind", "user_id", "user_name", "user_email", "page_url", "message"],
    rows.map(({ fb, name, email }) => [fb.id, fb.createdAt.toISOString(), fb.kind, fb.userId ?? "", name ?? "",
      email ?? "", fb.pageUrl ?? "", fb.message]),
  );
  return csvResponse("feedback", body);
});

admin.get("/export/users.csv", async (c) => {
  const db = c.var.db;
  const all = await db.select().from(users).orderBy(desc(users.createdAt));
  const reqCounts = new Map(
    (await db.select({ id: testRequests.ownerId, n: count() }).from(testRequests).groupBy(testRequests.ownerId))
      .map((r) => [r.id, r.n]),
  );
  const enrCounts = new Map(
    (await db.select({ id: enrollments.testerId, n: count() }).from(enrollments).groupBy(enrollments.testerId))
      .map((r) => [r.id, r.n]),
  );
  const body = toCsv(
    ["user_id", "created_at", "name", "email", "is_admin", "requests_created", "enrollments_made"],
    all.map((u) => [u.id, u.createdAt.toISOString(), u.name, u.email, u.isAdmin, reqCounts.get(u.id) ?? 0,
      enrCounts.get(u.id) ?? 0]),
  );
  return csvResponse("users", body);
});
