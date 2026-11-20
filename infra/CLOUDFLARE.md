# Deployment on Cloudflare (no containers)

```
app.betapod.io  → Worker "betapod-app"   (worker/)
                    ├─ /api/*      → Hono API (TypeScript port of api/)
                    ├─ /uploads/*  → R2 bucket "betapod-uploads"
                    └─ everything else → web/dist (SPA, index.html fallback)
betapod.io      → Worker "betapod-landing" (landing/, Next.js via OpenNext)

Database  → D1 "betapod-db" (SQLite): users, listing requests, enrollments, feedback
Rate limit → Durable Object "RateLimiter" (same limits/windows as before)
Images     → Images binding (validate, downscale to ≤2048px, strip metadata)
```

**Status (2026-11-20):** live on `app.betapod.io` and `betapod.io`. Production
started from an empty D1 database plus the 20 demo listings from
`worker/scripts/seed-demo.mjs`. The old VPS data was deliberately **not**
migrated; the migration tooling below is kept in case it's ever needed (it
requires an empty D1 database).

Requires the **Workers Paid plan** ($5/month, which also covers D1, R2 and Durable Objects at this scale). Password hashing (argon2id, same
parameters as the old API) costs ~400 ms CPU per login/register, which is
over the free plan's 10 ms limit.

Existing users keep working. The Worker verifies argon2-cffi hashes and
accepts session cookies signed by the old API, as long as `API_SECRET_KEY`
is the same.

## One-time setup

```bash
npx wrangler login

# 1. Database. Already done: betapod-db exists, its id is in worker/wrangler.jsonc,
#    and the schema is applied. For a new account:
#      npx wrangler d1 create betapod-db       → put database_id in worker/wrangler.jsonc
cd worker && npx wrangler d1 migrations apply betapod-db --remote

# 2. Uploads bucket
npx wrangler r2 bucket create betapod-uploads

# 3. Secret: use the SAME value as API_SECRET_KEY in the VPS .env
npx wrangler secret put API_SECRET_KEY
```

Turn on Cloudflare Images for the account (Dashboard → Images). The
`IMAGES` binding needs it for transformations.

## Move the data (on the VPS)

```bash
cd /opt/apptest
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... ./infra/migrate-to-cloudflare.sh
```

The script does three things:
- Runs `infra/pg-to-d1.sql` against the old Postgres. That turns every row into a SQLite `INSERT`, keeps the ids, converts timestamps to epoch ms and booleans to 0/1.
- Imports the result into D1 and prints row counts for both databases so you can compare.
- Copies the uploads volume to R2 under the same filenames, so stored `screenshot_path` values (`/uploads/<file>`) keep working.

Run it **once**, against a D1 database that has only the schema in it. A second
run fails on duplicate ids. To start over, recreate the database or delete
the rows.

## Deploy

```bash
make worker-install
make cf-deploy          # builds web/, deploys worker/ and landing/
```

Both `wrangler.jsonc` files declare `custom_domain` routes, so the first
deploy attaches `app.betapod.io` and `betapod.io`. The zone must be on
Cloudflare. Remove the old A records that point at the VPS first, or
Cloudflare will refuse to attach the domain.

To check before cutting DNS over, comment out `routes` and deploy to
`*.workers.dev` first. Note that the session cookie is scoped to
`API_COOKIE_DOMAIN` (`.betapod.io`), so logins only stick on the real domain.
For a workers.dev preview, set `API_COOKIE_DOMAIN` to `""`.

## Local development

No Docker needed. `wrangler dev` uses a local D1 and R2 under `worker/.wrangler/`.

```bash
cp worker/.dev.vars.example worker/.dev.vars
make worker-dev         # applies migrations locally, serves http://localhost:8787 (SPA + /api)
make worker-test        # typecheck + vitest, run inside workerd against local D1/R2/DO
```

## Schema changes

```bash
cd worker
npx wrangler d1 migrations create betapod-db add_something   # writes migrations/000N_add_something.sql
# edit the SQL and mirror it in src/db/schema.ts
npx wrangler d1 migrations apply betapod-db --local          # tests and dev pick it up automatically
npx wrangler d1 migrations apply betapod-db --remote
```

## Admin

```bash
cd worker
npx wrangler d1 execute betapod-db --remote \
  --command "UPDATE users SET is_admin = 1 WHERE email = 'you@example.com'"
```

To query the data, use `wrangler d1 execute betapod-db --remote --command "select ..."`
or open D1 in the Cloudflare dashboard. For backups, D1 Time Travel can restore
any point in the last 30 days (`wrangler d1 time-travel`), and
`wrangler d1 export betapod-db --remote --output backup.sql` takes a full dump.

## Rollback

Keep the VPS running for about a week after cutover. To roll back, point DNS at
the VPS again. Data written on Cloudflare in the meantime stays in D1 and R2,
and moving it back to Postgres needs a manual export
(`wrangler d1 export`, then convert the epoch-ms timestamps).
Password hashes created by the Worker verify in Python too, so accounts
created on Cloudflare would still work after such a move.
