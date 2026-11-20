// Port of api/app/routers/feedback.py.
import { Hono } from "hono";
import { feedback as feedbackTable } from "../db/schema";
import type { AppEnv } from "../env";
import { authed, currentUser } from "../lib/auth";
import { rateLimit } from "../lib/ratelimit";
import { parseJson } from "../lib/validate";
import { FeedbackCreate } from "../schemas";

export const feedback = new Hono<AppEnv>();

feedback.post("/", currentUser, async (c) => {
  const user = authed(c);
  const payload = await parseJson(c, FeedbackCreate);
  await rateLimit(c, `feedback:user:${user.id}`, 10, 3600);
  const [fb] = await c.var.db
    .insert(feedbackTable)
    .values({ userId: user.id, kind: payload.kind, message: payload.message.trim(), pageUrl: payload.page_url ?? null })
    .returning({ id: feedbackTable.id });
  return c.json({ ok: true, id: fb.id }, 201);
});
