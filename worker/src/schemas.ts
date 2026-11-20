// Zod equivalents of api/app/schemas/*.py.
import { z } from "zod";
import type { TestRequest } from "./db/schema";

export const RegisterIn = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const LoginIn = z.object({
  email: z.email(),
  password: z.string().min(1).max(128),
});

export const RequestCreate = z.object({
  app_name: z.string().min(1).max(120),
  play_store_url: z.url({ protocol: /^https?$/ }).max(500),
  category: z.string().min(1).max(60),
  description: z.string().min(1).max(5000),
  tester_count: z.number().int().gt(0).lte(500),
  duration_days: z.number().int().gt(0).lte(90),
  location: z.string().min(1).max(120),
});

export const FeedbackCreate = z.object({
  kind: z.enum(["bug", "improvement", "enhancement"]),
  message: z.string().min(5).max(5000),
  page_url: z.string().max(500).nullish(),
});

// FastAPI's bool query parsing accepts these spellings.
const queryBool = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (v === undefined) return false;
    const s = v.toLowerCase();
    if (["true", "1", "yes", "on", "t", "y"].includes(s)) return true;
    if (["false", "0", "no", "off", "f", "n"].includes(s)) return false;
    ctx.addIssue({ code: "custom", message: "Input should be a valid boolean" });
    return z.NEVER;
  });

export const ListQuery = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  has_open_slots: queryBool,
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const StatsQuery = z.object({
  days: z.coerce.number().int().default(30),
});

export function userOut(u: { id: number; name: string; email: string; createdAt: Date; isAdmin: boolean }) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    created_at: u.createdAt.toISOString(),
    is_admin: u.isAdmin,
  };
}

export function requestOut(
  r: TestRequest,
  opts: { enrolledCount: number; isEnrolled: boolean; isOwner: boolean },
) {
  return {
    id: r.id,
    owner_id: r.ownerId,
    app_name: r.appName,
    play_store_url: r.playStoreUrl,
    category: r.category,
    description: r.description,
    tester_count: r.testerCount,
    duration_days: r.durationDays,
    location: r.location,
    screenshot_path: r.screenshotPath,
    status: r.status,
    created_at: r.createdAt.toISOString(),
    enrolled_count: opts.enrolledCount,
    is_enrolled: opts.isEnrolled,
    is_owner: opts.isOwner,
  };
}
