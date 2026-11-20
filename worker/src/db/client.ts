import { drizzle } from "drizzle-orm/d1";
import type { Db, Env } from "../env";
import * as schema from "./schema";

export type DbHandle = { db: Db; close: () => Promise<void> };

export function d1Db(env: Env): DbHandle {
  return { db: drizzle(env.DB, { schema }), close: async () => {} };
}
