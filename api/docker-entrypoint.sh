#!/bin/sh
set -e

# Named volumes are root-owned by default. The API must run as appuser (uid 1000);
# without this chown, screenshot uploads and StaticFiles reads raise
# PermissionError → Internal Server Error.
mkdir -p /app/uploads

if [ "$(id -u)" = "0" ]; then
  chown -R appuser:appuser /app/uploads
  exec gosu appuser "$@"
fi

exec "$@"
