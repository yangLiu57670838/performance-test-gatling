import { rentingAppGraphqlSimulation } from "./flows/rentingAppGraphql";

/**
 * Local smoke test for the renting app BFF on localhost:4000:
 * create a company, then create a property for it.
 *
 *   npm run test:renting:local-smoke                       # 1 new user/sec for 30s
 *   npm run test:renting:local-smoke -- users=2 duration=60
 */
export default rentingAppGraphqlSimulation("local-renting-app-graphql", {
  name: "renting app graphql - local smoke test",
  users: 1,
  rampDuration: 0,
  duration: 30
});
