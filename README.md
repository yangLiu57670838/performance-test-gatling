# performance-test-gatling

Performance tests written in TypeScript with [Gatling JS](https://docs.gatling.io/reference/integrations/build-tools/js-cli/), targeting multiple local or remote domains and endpoints.

## Prerequisites

- Node.js 18+ (no Java needed: Gatling downloads its own GraalVM runtime into `~/.gatling`)

```bash
npm install
npm run install-gatling   # one-off download of the Gatling runtime (~200 MB)
```

## Quick start

```bash
npm run mock         # terminal 1: tiny API on http://localhost:3000 for the `local` target
npm run test:local   # terminal 2: smoke test every endpoint of `local`
```

The HTML report path is printed at the end of each run (`target/gatling/<run>/index.html`).

## Project layout

```
src/
  endpoints.gatling.ts   # generic simulation: all endpoints of the selected target(s)
  userJourney.gatling.ts # example scripted flow: feeder + response extraction
  config/
    targets.ts           # registry of domains and their endpoints  <- add yours here
    loadProfiles.ts      # smoke / load / stress / spike / soak
    params.ts            # CLI parameter / env var helpers
    types.ts
  lib/
    protocol.ts          # per-target HTTP protocol (base URL, headers, auth)
    requests.ts          # turns endpoint definitions into Gatling requests
    assertions.ts        # pass/fail thresholds
resources/data/          # feeder files (CSV/JSON)
scripts/mock-server.mjs  # local mock API
```

Any `src/*.gatling.ts` file with a `default` export is a simulation; select it with `--simulation <fileName>`.

## Running

```bash
# Several domains at once, each as its own scenario with its own base URL
npx gatling run --typescript --simulation endpoints targets=local,jsonplaceholder profile=load users=5

# Scripted journey
npm run test:journey -- profile=smoke users=3
```

Every setting can be passed as a `key=value` CLI parameter or as an env var (`rampDuration` becomes `RAMP_DURATION`). CLI parameters take precedence. See `.env.example`.

| Parameter         | Default           | Meaning                                                           |
| ----------------- | ----------------- | ----------------------------------------------------------------- |
| `targets`         | `local`           | Comma-separated target names (`endpoints` simulation)             |
| `target`          | `jsonplaceholder` | Single target (`userJourney` simulation)                          |
| `profile`         | `smoke`           | `smoke`, `load`, `stress`, `spike`, `soak`                        |
| `users`           | per profile       | Arrival rate in users/sec (total users for `smoke`/`spike` burst) |
| `duration`        | per profile       | Steady-state duration, seconds                                    |
| `rampDuration`    | per profile       | Ramp-up duration, seconds                                         |
| `thinkTime`       | `1`               | Max random pause between requests, seconds                        |
| `p95` / `p99`     | `1000`/`2000`     | Response-time thresholds, ms                                      |
| `maxErrorPercent` | `1`               | Max allowed failed-request percentage                             |
| `maxDuration`     | `14400`           | Hard stop for the run, seconds                                    |

A run exits with code 1 if any assertion fails, so it can be used as a CI gate.

## Renting app GraphQL (`local-renting-app-graphql`)

`src/rentingAppGraphqlLocalSmoke.gatling.ts` (local smoke test) runs, per virtual user, against `http://localhost:4000/graphql`:
`CreateRentingCompany` -> `CreateProperty` (using the returned company id).
Every request fails if the response contains GraphQL `errors`.

```bash
npm run test:renting:local-smoke                            # 1 new user/sec for 30 s
npm run test:renting:local-smoke -- users=0.5 duration=30   # fractional rates allowed
```

`src/rentingAppGraphqlProd.gatling.ts` runs the same flow against production (ramp to 10 users/sec
over 2 min, hold for 10 min). It requires `PROD_RENTING_APP_GRAPHQL_BASE_URL`:

```bash
PROD_RENTING_APP_GRAPHQL_BASE_URL=https://your-prod-host npm run test:renting:prod
```

Override the URL with `LOCAL_RENTING_APP_GRAPHQL_BASE_URL=http://host:port`.

## Adding a domain

Add an entry to `src/config/targets.ts`:

```ts
{
  name: "orders",
  baseUrl: "https://orders.staging.example.com",
  headers: { "x-api-key": "..." },
  endpoints: [
    { name: "list orders", method: "GET", path: "/v1/orders" },
    { name: "create order", method: "POST", path: "/v1/orders", body: { sku: "A1" }, expectStatus: [201] }
  ]
}
```

Then run with `targets=orders`. Per environment you can:

- override the base URL: `ORDERS_BASE_URL=https://orders.prod.example.com` or `ordersBaseUrl=...`
- send a bearer token: `ORDERS_TOKEN=xxx` (sent as `Authorization: Bearer xxx`)

For multi-step flows with correlation, copy `src/userJourney.gatling.ts`.

## Other commands

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run typecheck` | TypeScript type checking                   |
| `npm run build`     | Bundle simulations to `target/bundle.js`   |
| `npm run format`    | Prettier                                   |
| `npm run clean`     | Delete `target/`                           |
| `npm run recorder`  | Gatling recorder (capture browser traffic) |
