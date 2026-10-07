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
npm run test:renting:prod

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
  rentingAppGraphqlLocalSmoke.gatling.ts
  rentingAppGraphqlProd.gatling.ts
  flows/
    rentingAppGraphql.ts
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
