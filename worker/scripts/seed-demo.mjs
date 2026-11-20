#!/usr/bin/env node
// Seeds BetaPod with the 20 demo listings in demo-data/listings.json through
// the public API, so screenshots go through the same validation/resizing as
// real uploads. Safe to re-run: logs into existing demo accounts and skips
// listings an owner already has (matched by app name).
//
//   BASE_URL=https://app.betapod.io SEED_PASSWORD=... node scripts/seed-demo.mjs [--refresh-screenshots] [--owners=a,b]
//
// --refresh-screenshots re-uploads the image for listings that already exist
// (e.g. after replacing a file in demo-data/images). It prints the replaced
// /uploads paths; those R2 objects are orphaned and can be deleted.
//
// SEED_PASSWORD is the password for all four demo owner accounts; keep it
// the same across runs so existing accounts can log in.
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.BASE_URL?.replace(/\/$/, "");
const PASSWORD = process.env.SEED_PASSWORD;
if (!BASE_URL || !PASSWORD || PASSWORD.length < 8) {
  console.error("Set BASE_URL and SEED_PASSWORD (min 8 chars).");
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(join(here, "demo-data/listings.json"), "utf8"));
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
const REFRESH = process.argv.includes("--refresh-screenshots");
// --owners=larkspur,mintgrove limits the run to those owner keys.
const ONLY = process.argv.find((a) => a.startsWith("--owners="))?.slice(9).split(",");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch against the API, retrying on 429 (the API rate-limits registration and creation). */
async function api(path, { cookie, json, form, method = "GET" } = {}) {
  for (let attempt = 0; ; attempt++) {
    const headers = {};
    if (cookie) headers.cookie = cookie;
    if (json) headers["content-type"] = "application/json";
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: json ? JSON.stringify(json) : form,
    });
    if (res.status === 429 && attempt < 20) {
      console.log(`  rate limited on ${path}; waiting 60s…`);
      await sleep(60_000);
      continue;
    }
    return res;
  }
}

async function session(owner) {
  const creds = { email: owner.email, password: PASSWORD };
  let res = await api("/auth/login", { method: "POST", json: creds });
  if (res.status === 401) {
    res = await api("/auth/register", { method: "POST", json: { ...creds, name: owner.name } });
    if (res.status !== 201) throw new Error(`register ${owner.email}: ${res.status} ${await res.text()}`);
    console.log(`created account ${owner.email}`);
  } else if (res.status !== 200) {
    throw new Error(`login ${owner.email}: ${res.status} ${await res.text()}`);
  }
  const token = res.headers.getSetCookie().find((c) => c.startsWith("betapod_session="));
  if (!token) throw new Error(`no session cookie for ${owner.email}`);
  return token.split(";")[0];
}

/** The owner's existing listings, keyed by app name. */
async function ownedListings(cookie) {
  const byName = new Map();
  for (let offset = 0; ; offset += 100) {
    const page = await (await api(`/requests?limit=100&offset=${offset}`, { cookie })).json();
    for (const r of page) if (r.is_owner) byName.set(r.app_name, r);
    if (page.length < 100) return byName;
  }
}

async function uploadScreenshot(cookie, id, image, appName) {
  const bytes = await readFile(join(here, "demo-data/images", image));
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: MIME[image.split(".").pop()] }), image);
  const up = await api(`/requests/${id}/screenshot`, { method: "POST", cookie, form });
  if (up.status !== 200) throw new Error(`screenshot ${appName}: ${up.status} ${await up.text()}`);
  return (await up.json()).screenshot_path;
}

let created = 0;
let skipped = 0;
const replaced = [];
for (const owner of data.owners.filter((o) => !ONLY || ONLY.includes(o.key))) {
  const cookie = await session(owner);
  const existing = await ownedListings(cookie);
  for (const l of data.listings.filter((x) => x.owner === owner.key)) {
    const current = existing.get(l.app_name);
    if (current) {
      if (REFRESH) {
        const path = await uploadScreenshot(cookie, current.id, l.image, l.app_name);
        if (current.screenshot_path) replaced.push(current.screenshot_path);
        console.log(`  #${current.id} ${l.app_name}: screenshot -> ${path}`);
      } else {
        skipped++;
      }
      continue;
    }
    const { owner: _o, image, ...payload } = l;
    const res = await api("/requests", { method: "POST", cookie, json: payload });
    if (res.status !== 201) throw new Error(`create ${l.app_name}: ${res.status} ${await res.text()}`);
    const { id } = await res.json();

    await uploadScreenshot(cookie, id, image, l.app_name);
    created++;
    console.log(`  #${id} ${l.app_name}  (${owner.name})`);
  }
}
console.log(`done: ${created} created, ${skipped} already present, ${replaced.length} screenshots replaced`);
if (replaced.length) console.log("orphaned uploads (safe to delete from R2):\n" + replaced.join("\n"));
