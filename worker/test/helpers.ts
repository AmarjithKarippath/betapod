import { applyD1Migrations, env, reset } from "cloudflare:test";
import { createApp } from "../src/app";
import { d1Db } from "../src/db/client";
import type { Env } from "../src/env";

export const PNG_1PX = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="),
  (ch) => ch.charCodeAt(0),
);

/** Passes images through unchanged; rejects anything without a known header. */
function fakeImages() {
  const read = async (s: ReadableStream) => new Uint8Array(await new Response(s).arrayBuffer());
  const formatOf = (b: Uint8Array) =>
    b[0] === 0x89 && b[1] === 0x50 ? "image/png" : b[0] === 0xff && b[1] === 0xd8 ? "image/jpeg" : null;
  return {
    async info(s: ReadableStream) {
      const f = formatOf(await read(s));
      if (!f) throw Object.assign(new Error("not an image"), { code: 9412 });
      return { format: f, width: 1, height: 1, fileSize: 1 };
    },
    input(s: ReadableStream) {
      const t = {
        transform: () => t,
        output: async () => {
          const bytes = await read(s);
          return { image: () => new Blob([bytes]).stream(), contentType: () => formatOf(bytes) };
        },
      };
      return t;
    },
  };
}

/** Wipes all local storage (D1, R2, Durable Objects) and re-applies migrations. */
export async function setup() {
  await reset();
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  const app = createApp(d1Db);
  // Images transforms aren't available offline; everything else is real.
  const testEnv = { ...(env as unknown as Env), IMAGES: fakeImages() } as unknown as Env;
  return { app, env: testEnv, db: env.DB, client: () => new Client(app, testEnv) };
}

type App = ReturnType<typeof createApp>;

/** Minimal HTTP client with a cookie jar, like FastAPI's TestClient. */
export class Client {
  cookies = new Map<string, string>();
  ip = `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  constructor(
    private app: App,
    private env: Env,
  ) {}

  async fetch(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers = new Headers(init.headers);
    headers.set("cf-connecting-ip", this.ip);
    if (this.cookies.size) {
      headers.set("cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    }
    let body = init.body;
    if (init.json !== undefined) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(init.json);
    }
    const res = await this.app.request(path, { ...init, headers, body }, this.env);
    for (const sc of res.headers.getSetCookie()) {
      const [pair, ...attrs] = sc.split(";");
      const [k, v] = [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)];
      const expired = attrs.some((a) => /max-age=0\b/i.test(a.trim()) || /expires=thu, 01 jan 1970/i.test(a.trim()));
      if (expired || v === "") this.cookies.delete(k);
      else this.cookies.set(k, v);
    }
    return res;
  }
  get = (p: string) => this.fetch(p);
  post = (p: string, json?: unknown) => this.fetch(p, { method: "POST", json });
  del = (p: string) => this.fetch(p, { method: "DELETE" });
}

export async function register(c: Client, email = "alice@example.com", name = "Alice", password = "hunter2hunter") {
  return c.post("/api/auth/register", { email, name, password });
}

export const SAMPLE_REQUEST = {
  app_name: "My App",
  play_store_url: "https://play.google.com/store/apps/details?id=com.example",
  category: "Productivity",
  description: "Please test my app",
  tester_count: 2,
  duration_days: 14,
  location: "UK",
};
