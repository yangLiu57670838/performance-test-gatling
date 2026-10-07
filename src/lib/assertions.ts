import { Assertion, global } from "@gatling.io/core";
import { intParam } from "../config/params";

/**
 * Default pass/fail criteria. Override thresholds from the CLI, e.g.
 *   p95=800 maxErrorPercent=1
 */
export const defaultAssertions = (): Assertion[] => [
  global().failedRequests().percent().lte(intParam("maxErrorPercent", 1)),
  global().responseTime().percentile(95).lt(intParam("p95", 1000)),
  global().responseTime().percentile(99).lt(intParam("p99", 2000))
];
