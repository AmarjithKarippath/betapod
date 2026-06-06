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
