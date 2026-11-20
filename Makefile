.PHONY: up down logs ps build rebuild api-shell db-shell migrate revision test fmt lint clean

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

build:
	docker compose build

rebuild:
	docker compose build --no-cache

api-shell:
	docker compose exec api bash

db-shell:
	docker compose exec db psql -U $${POSTGRES_USER:-apptest} -d $${POSTGRES_DB:-apptest}

migrate:
	docker compose exec api alembic upgrade head

revision:
	docker compose exec api alembic revision --autogenerate -m "$(m)"

test:
	docker compose exec api pytest -v

fmt:
	docker compose exec api ruff format .
	docker compose exec api ruff check --fix .

lint:
	docker compose exec api ruff check .

clean:
	docker compose down -v

# --- Cloudflare (worker/ = API + SPA, landing/ = OpenNext) ---
.PHONY: worker-install worker-dev worker-test cf-deploy

worker-install:
	cd worker && npm install
	cd web && npm install

worker-dev:
	cd web && npm run build
	cd worker && npx wrangler d1 migrations apply betapod-db --local && npx wrangler dev

worker-test:
	cd worker && npx tsc --noEmit && npx vitest run

cf-deploy:
	cd worker && npm run deploy
	cd landing && npm run cf:deploy
