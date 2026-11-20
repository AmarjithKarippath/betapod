// Replaces the StaticFiles mount at /uploads: serves screenshots from R2.
import { Hono } from "hono";
import type { AppEnv } from "../env";

export const uploads = new Hono<AppEnv>();

uploads.get("/:key{[A-Za-z0-9_-]+\\.(?:jpg|png|webp)}", async (c) => {
  const obj = await c.env.UPLOADS.get(c.req.param("key"));
  if (!obj) return c.json({ detail: "Not Found" }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  // Filenames are random and never reused, so they can be cached forever.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
});

uploads.get("*", (c) => c.json({ detail: "Not Found" }, 404));
