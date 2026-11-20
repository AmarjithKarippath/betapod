import type { Context } from "hono";
import type { AppEnv } from "../env";
import { ApiError } from "./errors";

/** Raises 429 when over the limit. Fails open if the limiter is unavailable. */
export async function rateLimit(
  c: Context<AppEnv>,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  let allowed = true;
  try {
    const stub = c.env.RATE_LIMITER.get(c.env.RATE_LIMITER.idFromName(`rl:${key}`));
    allowed = await stub.hit(limit, windowSeconds);
  } catch (e) {
    console.warn("rate limiter unavailable, failing open", e);
  }
  if (!allowed) throw new ApiError(429, "Too many requests. Please try again later.");
}
