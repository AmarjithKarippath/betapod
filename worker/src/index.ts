import { createApp } from "./app";
import { d1Db } from "./db/client";

export { RateLimiter } from "./do/RateLimiter";

export default createApp(d1Db);
