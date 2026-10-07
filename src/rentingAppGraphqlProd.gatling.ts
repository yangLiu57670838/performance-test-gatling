import { rentingAppGraphqlSimulation } from "./flows/rentingAppGraphql";

/**
 * Renting app BFF in production: ramp 1 -> 10 new users/sec over 2 min, then hold 10 users/sec
 * for 10 min. Peaks at ~20 req/s and creates ~6,700 companies plus ~6,700 properties per run.
 *
 *   PROD_RENTING_APP_GRAPHQL_BASE_URL=https://api.example.com \
 *   PROD_RENTING_APP_GRAPHQL_TOKEN=xxx \
 *   npm run test:renting:prod
 */
export default rentingAppGraphqlSimulation("prod-renting-app-graphql", {
  name: "renting app graphql - prod load test",
  users: 10,
  rampDuration: 120,
  duration: 600
});
