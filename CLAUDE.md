# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Interview project: a small accounts/transactions API with a double-entry ledger. NestJS 12 + TypeORM + PostgreSQL 18, Node 24 (`nvm use`).

## Commands

```bash
npm run setup                 # fresh clone: .env, npm install, postgres up, migrate, seed (scripts/setup.sh)
npm run start:dev             # watch mode, port from PORT (default 3000)

npm run db:up                 # postgres:18 in docker (container: cdx-postgres)
npm run typeorm:migrate       # run migrations (uses dataSourceScript.ts)
npm run db:seed               # idempotent seed: transaction types + system account

# API image; joins the compose network to reach postgres
docker build -t cdx-api .
docker run --rm -p 3000:3000 --network cdx_interview_default --env-file .env -e DB_HOST=postgres cdx-api

npm run lint                  # oxlint src/ test/
npm run format                # prettier
npm run build

npm test                                        # unit tests: src/**/*.spec.ts (vitest, globals on)
npx vitest run src/domains/transactions/transactions.service.spec.ts   # single file
npx vitest run -t "Insufficient funds"          # by test name
npm run test:e2e                                # test/**/*.e2e.spec.ts

npm run typeorm:create --name=<Name>            # empty migration
npm run typeorm:rollback
```

`typeorm:generate` is mentioned in the README but has no npm script; migrations are hand-written.

**Ask before running anything that changes the database** (`typeorm:migrate`, `typeorm:rollback`, `db:seed`, schema drops).

## Architecture

Two layers under `src/`:

- `infra/` — framework and persistence. `infra/app/app.module.ts` is the root module and registers a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), so every DTO must declare all accepted fields with class-validator decorators.
- `domains/<name>/` — feature modules (controller, service, `dto/`). Domains do not own entities or repositories; they import them from `infra/database/typeorm/models`.

### API docs (Swagger)

- Swagger UI is served at `/docs`; `infra/app/swagger.ts` builds the document.
- DTO schemas come from the `@nestjs/swagger` CLI plugin (`nest-cli.json`, `introspectComments`). It reads property types, class-validator rules and JSDoc comments (`/** description @example x */`), so document DTO fields with JSDoc instead of `@ApiProperty`. Use explicit decorators only where the plugin can't infer something, e.g. `@ApiPropertyOptional` for a field that has a default value.
- Controllers declare `@ApiTags`, `@ApiOperation` and one `@Api*Response` per status code they can return. `AppController` (`GET /`) is excluded from the docs.
- Vitest does not run the plugin, so `swagger.spec.ts` can check paths and response codes but not DTO schemas.

### Persistence wiring

- `typeorm/dataSource.ts` builds options from env. `synchronize: false` (schema changes only via migrations) and `parseInt8: true` so `bigint` columns come back as JS numbers.
- `typeorm/dataSourceScript.ts` is the separate DataSource used by the TypeORM CLI.
- Each model lives in `typeorm/models/<name>/{entity,repository,index}.ts` and is re-exported from `models/index.ts`.
- `nestjs/DatabaseModule` is `@Global` and imports `RepositoryModule`, which is where every entity (`TypeOrmModule.forFeature`) and repository provider must be registered. Domain modules can then inject repositories without importing anything.
- Repositories extend `BaseRepository`. Every method that may run inside a DB transaction takes an optional `EntityManager` and uses `this.repo(manager)`, which falls back to the default repository when no manager is passed. Keep this pattern for new methods.

### Money and ledger model

- Amounts are **signed integer cents** (`bigint`). The API takes a positive `amount`; `TransactionEntity.open()` negates it for debit types (`purchase`, `purchase_with_installments`, `withdraw`).
- An account's balance is not stored. It is `SUM(ledgers.amount)` for that account (`LedgerRepository.getBalance`).
- `ledgers` is append-only. Each transaction writes two entries that sum to zero: the customer's account gets `+amount`, and the **system account** gets `-amount`.
- The system account is a regular `accounts` row referenced from `system_accounts` (enabled, not soft-deleted). The seed creates it with id `00000000-0000-7000-8000-000000000001`. Transactions against it are rejected.
- `TransactionsService.create` runs everything in one `dataSource.transaction`: it validates the account, system account and type, checks funds for debits (`isCoveredBy`), saves the transaction as `PENDING`, writes the ledger pair, then marks it `COMPLETED`.
- Transaction types are a seeded lookup table (`transaction_types`, smallint ids). The API refers to them by `code`, which mirrors the `TransactionType` enum in `models/transactionType/entity.ts`. Keep the enum and `seed.sql` in sync.

### Schema conventions

- PKs are `uuid` defaulting to Postgres `uuidv7()`, which needs Postgres 18.
- snake_case columns are mapped via `name:` on camelCase properties, and timestamps use `timestamptz`.
- Status and document type use native Postgres enums (`enumName`). Keep the schema minimal: **no CHECK constraints**.
- The single v1 migration (`migration/1790720426282V1Schema.ts`) may be edited in place, since this is a practice project. Keep `src/infra/database/erdSchema.erd.json` in step with schema changes.
- DTOs use snake_case fields (`account_id`, `document_type`) to match the API contract. Response DTOs map entities through a static `fromEntity`.

### Tests

Unit tests are colocated `*.spec.ts` files. Services are tested with hand-rolled `vi.fn()` mocks of the repositories. `dataSource.transaction` is mocked to invoke the callback with a stub `EntityManager`; the Nest testing module is not used.

## Conventions

- File names are camelCase with dot suffixes, and never use hyphens (e.g. `createAccount.dto.ts`, `accountResponse.dto.ts`).
- Every change must come with a test case: add or update the colocated `*.spec.ts` for the code you touched, and run `npm test` before finishing.
