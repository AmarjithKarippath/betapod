# Deployment (CloudPanel + Docker)

CloudPanel handles TLS, the public-facing reverse proxy, and DNS-level concerns.
Docker just runs the three app containers + Postgres + Redis on loopback ports.

## Architecture

```
Internet → CloudPanel (nginx + Let's Encrypt) → 127.0.0.1:<port> → container
```

| Subdomain                  | CloudPanel proxies to | Container |
|----------------------------|-----------------------|-----------|
| `betapod.io`      | `127.0.0.1:8003`      | landing   |
| `app.betapod.io`  | `127.0.0.1:8002`      | web (SPA) |
| `app.betapod.io/api/*` and `/uploads/*` | `127.0.0.1:8001` | api |

Routing `/api/*` and `/uploads/*` through the same hostname as the SPA keeps
cookies first-party — no CORS, no SameSite drama.

## One-time setup on the VPS

1. **DNS**: point `betapod.io` and `app.betapod.io` at the VM.
2. **Clone repo** somewhere outside `/home/cloudpanel-site-user/htdocs` (e.g. `/opt/apptest`):
   ```bash
   sudo mkdir -p /opt && sudo chown $USER:$USER /opt
   git clone <repo> /opt/apptest
   cd /opt/apptest
   cp .env.prod.example .env
   # edit .env — set DOMAIN values, strong POSTGRES_PASSWORD, API_SECRET_KEY (openssl rand -hex 32)
   ```
3. **Start the stack**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   docker compose -f docker-compose.prod.yml ps
   ```
   Migrations run automatically on api startup.

## CloudPanel sites

Create two **Reverse Proxy** sites in CloudPanel.

### Site 1 — landing (`betapod.io`)
- Type: **Reverse Proxy**
- Domain: `betapod.io`
- Reverse proxy URL: `http://127.0.0.1:8003`
- Enable Let's Encrypt → issue certificate
- (Optional) Force HTTPS redirect

### Site 2 — app (`app.betapod.io`)
- Type: **Reverse Proxy**
- Domain: `app.betapod.io`
- Reverse proxy URL: `http://127.0.0.1:8002`  *(the SPA — default fallback)*
- Enable Let's Encrypt → issue certificate

Then add two extra nginx **location** rules for this site so `/api` and
`/uploads` reach the FastAPI container instead of the SPA. In CloudPanel:

> Sites → app.betapod.io → **Vhost** → edit and add inside the
> `server { ... }` block (above the default `location /`):

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /uploads/ {
    proxy_pass http://127.0.0.1:8001/uploads/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Note the **trailing slash** on `proxy_pass http://127.0.0.1:8001/` — that strips
the `/api` prefix before forwarding, so FastAPI sees `/auth/login` not
`/api/auth/login`.

Save and CloudPanel reloads nginx. Test:

```bash
curl https://app.betapod.io/api/health
curl https://betapod.io
```

## First admin

```bash
docker compose -f docker-compose.prod.yml exec db \
  psql -U apptest -d apptest \
  -c "UPDATE users SET is_admin = true WHERE email = 'you@example.com';"
```

Log out and back in to pick up the flag in your session.

## Updates

```bash
cd /opt/apptest
git pull
docker compose -f docker-compose.prod.yml build api web landing
docker compose -f docker-compose.prod.yml up -d
```

API runs `alembic upgrade head` on every start, so migrations apply
automatically.

## Backups

CloudPanel has its own backup feature for the document root, but it won't
capture your Docker volumes. Use the included script for those:

```bash
sudo crontab -e
# add:
0 3 * * * /opt/apptest/infra/backup.sh >> /var/log/apptest-backup.log 2>&1
```

Dumps land in `/var/backups/apptest/` and prune after 14 days. For real prod,
also rsync to S3 or another host.

## Restore

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_restore -U apptest -d apptest --clean --if-exists \
  < /var/backups/apptest/db-YYYYMMDD-HHMMSS.dump

tar -xzf /var/backups/apptest/uploads-YYYYMMDD-HHMMSS.tar.gz -C /tmp/restore
docker cp /tmp/restore/uploads/. apptest-api-1:/app/uploads/
```

## Firewall reminder

The Docker ports bind to `127.0.0.1` only — they are *not* reachable from the
internet directly. Only CloudPanel's nginx is. Don't change the bind to
`0.0.0.0` unless you know what you're doing.
