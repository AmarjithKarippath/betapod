import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./db/schema";
import type { User } from "./db/schema";
import type { RateLimiter } from "./do/RateLimiter";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  UPLOADS: R2Bucket;
  IMAGES: ImagesBinding;
  RATE_LIMITER: DurableObjectNamespace<RateLimiter>;

  API_SECRET_KEY: string;
  API_JWT_EXPIRE_DAYS?: string;
  API_COOKIE_SECURE?: string;
  API_COOKIE_DOMAIN?: string;
  API_CORS_ORIGINS?: string;
}

export type Db = DrizzleD1Database<typeof schema>;

export type AppEnv = {
  Bindings: Env;
  Variables: { db: Db; user: User | null };
};
