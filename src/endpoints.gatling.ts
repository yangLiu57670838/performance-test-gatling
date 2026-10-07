import { scenario, simulation } from "@gatling.io/core";
import { injectionProfile } from "./config/loadProfiles";
import { intParam, listParam } from "./config/params";
import { getTargets } from "./config/targets";
import { defaultAssertions } from "./lib/assertions";
import { httpProtocolFor } from "./lib/protocol";
import { chainFor } from "./lib/requests";

/**
 * Hits every endpoint of one or more targets concurrently, each with its own base URL.
 *
 *   npx gatling run --typescript --simulation endpoints targets=local,jsonplaceholder profile=load users=5
 */
export default simulation((setUp) => {
  const targets = getTargets(listParam("targets", ["local"]));
  for (const target of targets) {
    if (target.endpoints.length === 0) {
      throw new Error(
        `Target "${target.name}" has no static endpoints; run its dedicated simulation instead`
      );
    }
  }
  const thinkTime = intParam("thinkTime", 1);

  const populations = targets.map((target) =>
    scenario(`${target.name} endpoints`)
      .exec(chainFor(target.endpoints, thinkTime))
      .injectOpen(...injectionProfile())
      .protocols(httpProtocolFor(target))
  );

  const [first, ...rest] = populations;
  setUp(first, ...rest)
    .assertions(...defaultAssertions())
    .maxDuration(intParam("maxDuration", 4 * 3600));
});
