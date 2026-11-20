import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

// Tests run inside workerd (same runtime as production) against local D1,
// R2 and the RateLimiter Durable Object, configured from wrangler.jsonc.
export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: "./wrangler.jsonc" },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations("./migrations"),
          API_SECRET_KEY: "test-secret",
          API_COOKIE_SECURE: "false",
          API_COOKIE_DOMAIN: "",
          API_CORS_ORIGINS: "http://localhost:5173",
        },
      },
    })),
  ],
  test: { testTimeout: 30_000 },
});
