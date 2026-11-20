#!/usr/bin/env node
// Seeds BetaPod with the 20 demo listings in demo-data/listings.json through
// the public API, so screenshots go through the same validation/resizing as
// real uploads. Safe to re-run: logs into existing demo accounts and skips
// listings an owner already has (matched by app name).
//
//   BASE_URL=https://app.betapod.io SEED_PASSWORD=... node scripts/seed-demo.mjs
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

async function ownedAppNames(cookie) {
  const names = new Set();
  for (let offset = 0; ; offset += 100) {
    const page = await (await api(`/requests?limit=100&offset=${offset}`, { cookie })).json();
    for (const r of page) if (r.is_owner) names.add(r.app_name);
    if (page.length < 100) return names;
  }
}

let created = 0;
let skipped = 0;
for (const owner of data.owners) {
  const cookie = await session(owner);
  const existing = await ownedAppNames(cookie);
  for (const l of data.listings.filter((x) => x.owner === owner.key)) {
    if (existing.has(l.app_name)) {
      skipped++;
      continue;
    }
    const { owner: _o, image, ...payload } = l;
    const res = await api("/requests", { method: "POST", cookie, json: payload });
    if (res.status !== 201) throw new Error(`create ${l.app_name}: ${res.status} ${await res.text()}`);
    const { id } = await res.json();

    const bytes = await readFile(join(here, "demo-data/images", image));
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: MIME[image.split(".").pop()] }), image);
    const up = await api(`/requests/${id}/screenshot`, { method: "POST", cookie, form });
    if (up.status !== 200) throw new Error(`screenshot ${l.app_name}: ${up.status} ${await up.text()}`);
    created++;
    console.log(`  #${id} ${l.app_name}  (${owner.name})`);
  }
}
console.log(`done: ${created} created, ${skipped} already present`);
