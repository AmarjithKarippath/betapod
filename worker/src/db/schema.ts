// D1 (SQLite) schema. Table/column/constraint names match the old Postgres
// schema from api/alembic (revision 0003) so data migrates 1:1.
// Timestamps are stored as epoch milliseconds (UTC); Drizzle maps them to Date.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, unique, uniqueIndex } from "drizzle-orm/sqlite-core";

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(cast(unixepoch('subsec') * 1000 as integer))`);

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [uniqueIndex("ix_users_email").on(t.email)],
);

export const testRequests = sqliteTable(
  "test_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    appName: text("app_name").notNull(),
    playStoreUrl: text("play_store_url").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    testerCount: integer("tester_count").notNull(),
    durationDays: integer("duration_days").notNull(),
    location: text("location").notNull(),
    screenshotPath: text("screenshot_path"),
    status: text("status").notNull().default("open"),
    createdAt: createdAt(),
  },
  (t) => [
    index("ix_test_requests_owner_id").on(t.ownerId),
    index("ix_test_requests_category").on(t.category),
    index("ix_test_requests_location").on(t.location),
    index("ix_test_requests_status").on(t.status),
    check("ck_tester_count_positive", sql`${t.testerCount} > 0`),
    check("ck_duration_positive", sql`${t.durationDays} > 0`),
  ],
);

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requestId: integer("request_id")
      .notNull()
      .references(() => testRequests.id, { onDelete: "cascade" }),
    testerId: integer("tester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [
    unique("uq_enrollment_request_tester").on(t.requestId, t.testerId),
    index("ix_enrollments_request_id").on(t.requestId),
    index("ix_enrollments_tester_id").on(t.testerId),
  ],
);

export const feedback = sqliteTable(
  "feedback",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    kind: text("kind").notNull(),
    message: text("message").notNull(),
    pageUrl: text("page_url"),
    createdAt: createdAt(),
  },
  (t) => [index("ix_feedback_user_id").on(t.userId), index("ix_feedback_kind").on(t.kind)],
);

export type User = typeof users.$inferSelect;
export type TestRequest = typeof testRequests.$inferSelect;
