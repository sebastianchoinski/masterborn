NEW_API_DIR := new-recruitment-api

.PHONY: install build test migrate seed up down logs dev

install:
	cd $(NEW_API_DIR) && npm install

build:
	cd $(NEW_API_DIR) && npm run build

test:
	cd $(NEW_API_DIR) && npm test

migrate:
	cd $(NEW_API_DIR) && DATABASE_URL="file:./dev.db" npm run prisma:migrate

seed:
	cd $(NEW_API_DIR) && DATABASE_URL="file:./dev.db" npm run prisma:seed

dev:
	docker compose up -d legacy-api
	cd $(NEW_API_DIR) && DATABASE_URL="file:./dev.db" LEGACY_API_URL="http://localhost:4040" npm run dev

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f