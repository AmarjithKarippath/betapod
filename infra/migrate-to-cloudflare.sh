#!/usr/bin/env bash
# One-time data move from the VPS Docker stack to Cloudflare (D1 + R2).
# Run ON THE VPS from the repo root (/opt/apptest), with the old stack's db up.
#
#   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... ./infra/migrate-to-cloudflare.sh
#
# The D1 database must be EMPTY apart from the schema
# (npx wrangler d1 migrations apply betapod-db --remote). Re-running the
# import against a populated database fails on duplicate ids.
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?set CLOUDFLARE_API_TOKEN (D1 + R2 write access)}"
D1_DB="${D1_DB:-betapod-db}"
BUCKET="${R2_BUCKET:-betapod-uploads}"
COMPOSE="docker compose -f docker-compose.prod.yml"
WRANGLER="npx --yes wrangler@4"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

set -a; source .env; set +a

echo "==> Exporting Postgres as SQLite INSERTs"
$COMPOSE exec -T db psql -q -v ON_ERROR_STOP=1 -At -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  < infra/pg-to-d1.sql > "$WORK/data.sql"
grep -c '^INSERT' "$WORK/data.sql" | xargs echo "    statements:"

echo "==> Importing into D1 '$D1_DB'"
$WRANGLER d1 execute "$D1_DB" --remote --yes --file "$WORK/data.sql"

echo "==> Row counts (Postgres vs D1)"
COUNTS="select (select count(*) from users) as users, (select count(*) from test_requests) as requests,
        (select count(*) from enrollments) as enrollments, (select count(*) from feedback) as feedback"
$COMPOSE exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$COUNTS"
$WRANGLER d1 execute "$D1_DB" --remote --command "$COUNTS"

echo "==> Copying uploads to R2 bucket '$BUCKET'"
API_CID="$($COMPOSE ps -aq api | head -1)"
docker cp "$API_CID:/app/uploads/." "$WORK/uploads/"
n=0
for f in "$WORK"/uploads/*.{jpg,png,webp}; do
  [ -e "$f" ] || continue
  case "$f" in *.jpg) ct=image/jpeg ;; *.png) ct=image/png ;; *.webp) ct=image/webp ;; esac
  npx --yes wrangler@4 r2 object put "$BUCKET/$(basename "$f")" --file "$f" --content-type "$ct" --remote >/dev/null
  n=$((n + 1))
done
echo "    uploaded $n files"
echo "Done."
