#!/usr/bin/env bash
# Postgres + uploads backup. Run nightly via cron on the host:
#   0 3 * * * /opt/apptest/infra/backup.sh >> /var/log/apptest-backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/apptest}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

cd "$(dirname "$0")/.."

# Load .env so we know the DB creds
set -a
. ./.env
set +a

# Postgres dump (custom format — smaller, restorable with pg_restore)
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc \
  > "$BACKUP_DIR/db-$STAMP.dump"

# Uploads tarball
docker compose -f docker-compose.prod.yml run --rm --no-deps \
  -v "$BACKUP_DIR:/backup" api \
  tar -C /app -czf "/backup/uploads-$STAMP.tar.gz" uploads

# Prune old backups
find "$BACKUP_DIR" -type f -name "db-*.dump" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -type f -name "uploads-*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -u +%FT%TZ)] backup ok: db-$STAMP.dump, uploads-$STAMP.tar.gz"
