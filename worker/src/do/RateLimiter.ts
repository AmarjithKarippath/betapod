import { DurableObject } from "cloudflare:workers";

/**
 * Fixed-window counter, one instance per rate-limit key (port of the Redis
 * INCR/EXPIRE scheme in api/app/core/ratelimit.py). The alarm wipes storage
 * when the window ends so idle keys don't accumulate.
 */
export class RateLimiter extends DurableObject {
  /** Records one hit; returns true if the caller is still within `limit`. */
  async hit(limit: number, windowSeconds: number): Promise<boolean> {
    const now = Date.now();
    let resetAt = (await this.ctx.storage.get<number>("resetAt")) ?? 0;
    let count = (await this.ctx.storage.get<number>("count")) ?? 0;
    if (now >= resetAt) {
      count = 0;
      resetAt = now + windowSeconds * 1000;
      await this.ctx.storage.setAlarm(resetAt);
    }
    count += 1;
    await this.ctx.storage.put({ count, resetAt });
    return count <= limit;
  }

  async alarm(): Promise<void> {
    await this.ctx.storage.deleteAll();
  }
}
