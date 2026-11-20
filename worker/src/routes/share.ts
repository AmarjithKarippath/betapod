// Social link previews for listing pages. The SPA's index.html has only
// generic tags, and crawlers (X, WhatsApp, LinkedIn, Facebook, Slack…) don't
// run JavaScript, so for /requests/<id> we serve index.html with that
// listing's Open Graph / Twitter tags injected. Browsers get the same page
// and the SPA takes over as usual.
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { DbHandle } from "../db/client";
import { testRequests } from "../db/schema";
import type { AppEnv, Env } from "../env";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function summary(text: string, max = 200) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

/** index.html from the assets binding, with mutable headers. */
async function spaShell(env: Env, url: string): Promise<Response> {
  const res = await env.ASSETS.fetch(new URL("/", url));
  return new Response(res.body, res);
}

export function sharePages(openDb: (env: Env) => DbHandle) {
  const share = new Hono<AppEnv>();

  share.get("/:id{[0-9]+}", async (c) => {
    const page = await spaShell(c.env, c.req.url);
    const handle = openDb(c.env);
    let req;
    try {
      [req] = await handle.db
        .select()
        .from(testRequests)
        .where(eq(testRequests.id, Number(c.req.param("id"))))
        .limit(1);
    } catch (e) {
      console.error("share preview lookup failed", e);
    } finally {
      await handle.close();
    }
    if (!req) return page; // SPA renders its own "not found"

    // Previews must use https (crawlers reject mixed-content images); keep
    // plain http only for local development.
    const u = new URL(c.req.url);
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    const origin = `${local ? u.protocol : "https:"}//${u.host}`;
    const url = `${origin}/requests/${req.id}`;
    const title = `Test ${req.appName} on BetaPod`;
    const description = summary(
      `Looking for ${req.testerCount} Android testers for a ${req.durationDays}-day Google Play test (${req.category}, ${req.location}). ${req.description}`,
    );
    const image = req.screenshotPath ? `${origin}${req.screenshotPath}` : null;

    const tags = [
      `<meta name="description" content="${esc(description)}">`,
      `<link rel="canonical" href="${esc(url)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:site_name" content="BetaPod">`,
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      `<meta property="og:url" content="${esc(url)}">`,
      image ? `<meta property="og:image" content="${esc(image)}">` : "",
      `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">`,
      `<meta name="twitter:title" content="${esc(title)}">`,
      `<meta name="twitter:description" content="${esc(description)}">`,
      image ? `<meta name="twitter:image" content="${esc(image)}">` : "",
    ].join("");

    return new HTMLRewriter()
      .on("title", { element: (el) => void el.setInnerContent(title) })
      // Drop index.html's generic tags so crawlers see only the listing's.
      .on('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"]', {
        element: (el) => void el.remove(),
      })
      .on("head", { element: (el) => void el.append(tags, { html: true }) })
      .transform(page);
  });

  // /requests/new and other client-side routes: plain SPA.
  share.get("*", async (c) => {
    const res = await c.env.ASSETS.fetch(c.req.raw);
    return new Response(res.body, res); // mutable headers for the security-header middleware
  });
  return share;
}
