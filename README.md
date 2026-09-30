# cdx-interview

NestJS + TypeORM + PostgreSQL. Node 24 (`nvm use`).

## Setup

```bash
cp .env.example .env
npm install
npm run db:up        # postgres:17 in docker (container: cdx-postgres)
npm run start:dev
```

## Structure

```
src/
  main.ts                 # loads env, boots Nest
  env.ts                  # dotenv (.env, or .env.production.local when NODE_ENV=production)
  infra/
    app/                  # root module
    database/
      typeorm/            # DataSource, CLI data source, BaseRepository
        models/<name>/    # entity.ts, repository.ts, index.ts
        migration/
      nestjs/             # DatabaseModule (global), DatabaseService, RepositoryModule
  domains/
    accounts/  transactions/  ledger/
```

New model: add `src/infra/database/typeorm/models/<name>/{entity,repository,index}.ts`,
then register the entity and repository in `src/infra/database/nestjs/repository.module.ts`.

## Migrations

```bash
npm run typeorm:create --name=<name>     # empty migration
npm run typeorm:generate --name=<name>   # diff from entities
npm run typeorm:migrate
npm run typeorm:rollback
```
## Notes

The document does not specify if the transactions and the amounts are only from card transactions, using available credit, or if the customer does have a wallet storing debit amount and credit card amounts.

I will assume that the customer does have a amount representing the available amount to transacting.

For simplicity, I will assume that the system will be *used for debit and credit*, but the customer will have only *one wallet*.
