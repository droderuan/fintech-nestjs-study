#!/bin/sh
# Prepares a fresh clone: dependencies, database, migrations and seed.
set -e

cd "$(dirname "$0")/.."

[ -f .env ] || cp .env.example .env

npm install

# --wait blocks until the postgres healthcheck passes.
docker compose up -d --wait postgres

npm run typeorm:migrate
npm run db:seed

echo "Setup done. Start the API with: npm run start:dev"
