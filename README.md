# OmniPays Backend

NestJS REST API for Soroban liquidity pools and swap routes. The service reads on-chain ledger entries and contract events through Mercury, stores subscription metadata in PostgreSQL with Prisma, caches aggregate responses in Redis, and exposes analytics and routing endpoints for Soroswap and Phoenix pools.

## Architecture

| Component | Responsibility |
| --- | --- |
| `AppModule` | Bootstraps configuration, global Redis cache, authentication, and feature modules |
| `AuthModule` | Validates the `apiKey` header for every route |
| `PrismaModule` | Provides the PostgreSQL client and connection checks |
| `PairsModule` | Ledger/event subscriptions, pool discovery, and pool aggregation |
| `InfoModule` | TVL, volume, fees, prices, APY, and token metadata |
| `EventsModule` | Router and pool event history |
| `UtilsModule` | Route/path calculation via `soroswap-router-sdk` |
| `src/services/mercury.ts` | Lazily created, network-scoped Mercury SDK clients |
| `src/config` | Environment schema and runtime configuration loader |

Swagger UI is served at `http://localhost:4000/docs` (or the configured `PORT`).

## Prerequisites

- Node.js 20 or newer and Yarn 1.x (`npm install -g yarn`)
- PostgreSQL 14+ and Redis 7+ (both are provided by Docker Compose for local development)
- Mercury credentials with access to the Soroban endpoints for each network
- Docker and Docker Compose for the containerized workflow

## Local setup

1. Create the environment file:

   ```bash
   cp .env.example .env
   ```

2. Fill in all values in `.env`. When running through Docker Compose use `REDIS_HOST=redis` and a `POSTGRES_URL` that points at the `pgdb` service, for example:

   ```bash
   POSTGRES_URL=postgresql://postgres:password@pgdb:5432/postgresdb?schema=public
   REDIS_HOST=redis
   ```

3. Start the stack (backend, PostgreSQL, and Redis):

   ```bash
   docker compose up --build
   ```

   The backend container installs dependencies, generates the Prisma client, applies migrations, and starts in watch mode.

## Environment variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` (default `development`) |
| `PORT` | HTTP port, integer between 1 and 65535 (default `4000`) |
| `BACKEND_URL` | Public backend URL used for internal API calls and route calculation |
| `API_KEY` | Non-empty value required in the `apiKey` header in every environment |
| `CORS_ORIGINS` | Optional comma-separated allowed origins; when absent CORS is open (`*`) |
| `POSTGRES_URL` | Prisma PostgreSQL connection string |
| `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Values used by the Compose PostgreSQL service |
| `REDIS_HOST`, `REDIS_PORT` | Redis connection details (`redis` and `6379` in Compose) |
| `MERCURY_TESTNET_BACKEND_ENDPOINT`, `MERCURY_TESTNET_GRAPHQL_ENDPOINT` | Mercury testnet endpoints |
| `MERCURY_BACKEND_ENDPOINT`, `MERCURY_GRAPHQL_ENDPOINT` | Mercury mainnet endpoints |
| `MERCURY_EMAIL`, `MERCURY_PASSWORD` | Mercury credentials shared by both networks |

Configuration is validated at bootstrap by `src/config/env-schema.ts`. Mercury clients and the internal HTTP client are created lazily so `.env` values are available before first use.

## Database and migrations

Prisma schema: `prisma/schema.prisma`. Common commands (run inside the backend container with `docker compose exec backend <command>` or locally after `yarn install`):

```bash
yarn prisma generate                 # generate the Prisma client
yarn prisma migrate dev              # create and apply a development migration
yarn prisma migrate deploy           # apply pending migrations (production)
yarn prisma studio                   # inspect tables
yarn prisma db push --force-reset    # destructive local-only reset
```

The database is **not** populated automatically on startup. Subscription and pool data are imported only when the authenticated endpoint `POST /update_database?network=<TESTNET|MAINNET>` is called, or when the manual subscription scripts create individual subscriptions.

## Scripts

| Command | Purpose |
| --- | --- |
| `yarn start:dev` | Start with watch mode |
| `yarn start:prod` | Start compiled output from `dist/` |
| `yarn build` | Compile with Nest CLI |
| `yarn lint` / `yarn format` | Check / apply ESLint and Prettier |
| `yarn test` / `yarn test:watch` / `yarn test:cov` | Run unit tests |
| `yarn test:e2e` | Run e2e tests (requires running Postgres, Redis, and Mercury access) |
| `yarn create:pair` | Create a test pair on Stellar testnet (requires network access) |
| `yarn subscribe:factory <testnet\|mainnet>` | Subscribe to the Soroswap factory |
| `yarn subscribe:router <testnet\|mainnet>` | Subscribe to router events |
| `yarn subscribe:pairs <testnet\|mainnet>` | Subscribe to events for stored pairs |
| `yarn subscribe:phoenix <testnet\|mainnet> <keyXdr>` | Subscribe to a Phoenix factory ledger key (the contract address comes from `src/constants`) |

## API examples

All protected endpoints require the `apiKey` header. Interactive documentation: `http://localhost:4000/docs`.

```bash
# Health (includes database connectivity)
curl http://localhost:4000/

# Subscribe Soroswap pairs
curl -X POST 'http://localhost:4000/pairs?network=TESTNET' \
  -H 'apiKey: <your_api_key>' -H 'Content-Type: application/json' \
  -d '{"contractId":["CBV3WDVJ7NC3RKVPBKLWXD46I6HL6GBZHSRBMJ6SLUAUISGITAB3DQO7"],"keyXdr":"AAAAFA==","durability":"persistent","hydrate":true}'

# Subscription counts
curl 'http://localhost:4000/pairs/count?network=TESTNET' -H 'apiKey: <your_api_key>'
curl 'http://localhost:4000/pairs/mercury-count?network=TESTNET' -H 'apiKey: <your_api_key>'

# All pools (optionally ?protocols=soroswap,phoenix)
curl -X POST 'http://localhost:4000/pairs/all?network=TESTNET' -H 'apiKey: <your_api_key>'

# Import missing subscriptions (no automatic import on boot)
curl -X POST 'http://localhost:4000/update_database?network=TESTNET' -H 'apiKey: <your_api_key>'

# Token USD price and pool information
curl 'http://localhost:4000/info/USDPrice/<token-contract>?network=TESTNET' -H 'apiKey: <your_api_key>'
curl 'http://localhost:4000/info/pool/<pool-contract>?network=TESTNET' -H 'apiKey: <your_api_key>'

# Router and pool events
curl -X POST 'http://localhost:4000/events/router?network=TESTNET' \
  -H 'apiKey: <your_api_key>' -H 'Content-Type: application/json' -d '{}'
curl -X POST 'http://localhost:4000/events/pool/<pool-contract>?network=TESTNET' \
  -H 'apiKey: <your_api_key>' -H 'Content-Type: application/json' -d '{}'
```

## Testing

`yarn test` runs Jest unit tests for pure helpers and parsers; it needs no database, Redis, or Mercury access. `yarn test:e2e` boots `AppModule` and therefore requires the external services and credentials described above. CI runs lint, build, and unit tests with dummy environment values only.

## Deployment notes

- Run `yarn prisma migrate deploy` before starting a new version, then `yarn start:prod`.
- Set real `API_KEY`, Mercury, PostgreSQL, and Redis values through the environment (never commit `.env`).
- Restrict `CORS_ORIGINS` to trusted frontends; leaving it unset keeps the previous open CORS behavior.
- The provided Dockerfile builds a compiled image, runs as a non-root user, and checks TCP connectivity to the configured `PORT`. Keep PostgreSQL, Redis, and Mercury traffic on private networks.
- Trigger `POST /update_database` explicitly when new subscriptions must be imported; startup will not mutate the database contents.

## Security and authentication

Every route is protected by `AuthMiddleware`, which validates the `apiKey` header with a timing-safe comparison. Health checks and Swagger remain reachable through the same middleware, so monitoring clients must send the key. The API key is loaded from `API_KEY`, is required in every environment, and should be rotated through the deployment environment.

## License

Unlicensed (`UNLICENSED` in `package.json`). All rights reserved by the project owners.
