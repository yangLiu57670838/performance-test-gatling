# performance-test-gatling

## Commands

```bash
# Setup
npm install
npm run install-gatling                     # one-off download of the Gatling runtime

# Run simulations
npm test                                    # pick a simulation interactively
npm run test:local                          # smoke test the `local` target (start `npm run mock` first)
npm run test:smoke                          # smoke test the default target via `endpoints`
npm run test:endpoints -- targets=local,jsonplaceholder profile=load users=5
npm run test:journey -- profile=smoke users=3
npm run test:renting:local-smoke
npm run test:renting:prod                   # requires PROD_RENTING_APP_GRAPHQL_BASE_URL

# Tooling
npm run mock                                # mock API on http://localhost:3000
npm run typecheck                           # TypeScript type checking
npm run build                               # bundle simulations to target/bundle.js
npm run format                              # Prettier (write)
npm run format:check                        # Prettier (check only)
npm run clean                               # delete target/
npm run recorder                            # Gatling recorder
```

## Project layout

```
src/
  endpoints.gatling.ts                  # generic simulation: all endpoints of the selected target(s)
  userJourney.gatling.ts                # example scripted flow: feeder + response extraction
  rentingAppGraphqlLocalSmoke.gatling.ts # renting app GraphQL, local smoke test
  rentingAppGraphqlProd.gatling.ts      # renting app GraphQL, production load test
  flows/
    rentingAppGraphql.ts                # shared renting app GraphQL flow
  config/
    targets.ts                          # registry of domains and their endpoints
    loadProfiles.ts                     # smoke / load / stress / spike / soak
    params.ts                           # CLI parameter / env var helpers
    types.ts
  lib/
    protocol.ts                         # per-target HTTP protocol (base URL, headers, auth)
    requests.ts                         # turns endpoint definitions into Gatling requests
    assertions.ts                       # pass/fail thresholds
resources/data/                         # feeder files (CSV/JSON)
scripts/mock-server.mjs                 # local mock API
```

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
