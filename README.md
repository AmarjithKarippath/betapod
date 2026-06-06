# BetaPod

A marketplace where developers post Play Store closed-testing requests and other devs enroll to test.

## Stack

- **landing** — Next.js (SEO marketing site)
- **web** — React + Vite SPA (the authenticated app)
- **api** — FastAPI + SQLAlchemy 2.0 + Alembic
- **db** — Postgres 16
- **redis** — caching + rate limits

Everything runs via `docker compose`.

## Quickstart

```bash
cp .env.example .env
# edit .env — at minimum set API_SECRET_KEY (openssl rand -hex 32)
make up
make migrate
```

Open:
- Landing: http://localhost:3000
- App: http://localhost:5173
- API docs: http://localhost:8000/docs

## Common commands

| Command | What it does |
|---|---|
| `make up` / `make down` | Start / stop all services |
| `make logs` | Tail logs |
| `make migrate` | Apply Alembic migrations |
| `make revision m="add foo"` | Generate a new migration |
| `make test` | Run pytest in the api container |
| `make db-shell` | Open psql |
| `make api-shell` | Bash into the api container |
| `make clean` | Down + remove volumes (DESTROYS DATA) |

## Project layout

```
api/        FastAPI service
web/        Vite React SPA
landing/    Next.js marketing site
infra/      nginx/Caddy configs, deployment scripts
uploads/    Screenshot storage (dev only)
```
