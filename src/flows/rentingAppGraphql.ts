import {
  constantUsersPerSec,
  exec,
  exitHereIfFailed,
  jmesPath,
  rampUsersPerSec,
  scenario,
  Session,
  simulation,
  StringBody
} from "@gatling.io/core";
import { http, HttpRequestActionBuilder, status } from "@gatling.io/http";
import { injectionProfile } from "../config/loadProfiles";
import { intParam, numberParam, param } from "../config/params";
import { getTarget } from "../config/targets";
import { defaultAssertions } from "../lib/assertions";
import { httpProtocolFor } from "../lib/protocol";

const CREATE_RENTING_COMPANY =
  "mutation CreateRentingCompany($input: CreateRentingCompanyInput!) { createRentingCompany(input: $input) { id name email createdAt } }";
const CREATE_PROPERTY =
  "mutation CreateProperty($input: CreatePropertyInput!) { createProperty(input: $input) { id rentingCompanyId status createdAt } }";

export interface RentingAppLoad {
  /** Scenario name shown in the Gatling report. */
  name: string;
  /** Peak arrival rate, new users per second (each user sends 2 requests). */
  users: number;
  /** Ramp from 1 user/sec up to `users`, in seconds. 0 disables the ramp. */
  rampDuration: number;
  /** Time held at the peak rate, in seconds. */
  duration: number;
}

const graphql = (
  operationName: string,
  query: string,
  variables: (session: Session) => Record<string, unknown>
): HttpRequestActionBuilder =>
  http(operationName)
    .post("/graphql")
    .body(
      StringBody((session) =>
        JSON.stringify({ operationName, query, variables: variables(session) })
      )
    )
    .asJson()
    .check(status().is(200), jmesPath("errors").notExists());

const initUser = exec((session) =>
  session
    .set("uniqueId", `${Date.now().toString(36)}-${session.userId()}`)
    .set("n", 1 + Math.floor(Math.random() * 999))
);

const createRentingCompany = exec(
  graphql("CreateRentingCompany", CREATE_RENTING_COMPANY, (session) => {
    const uniqueId = session.get("uniqueId");
    return {
      input: {
        name: `perf-agency-${uniqueId}`,
        email: `perf-${uniqueId}@loadtest.example`,
        phone: "+61 3 9000 0000",
        abn: "12 345 678 901",
        logoUrl: "https://example.com/logo.png"
      }
    };
  }).check(jmesPath("data.createRentingCompany.id").saveAs("companyId"))
);

const createProperty = exec(
  graphql("CreateProperty", CREATE_PROPERTY, (session) => ({
    input: {
      rentingCompanyId: session.get("companyId"),
      address: {
        street: `${session.get("n")} Collins Street`,
        suburb: "Melbourne",
        state: "VIC",
        postcode: "3000",
        country: "Australia"
      },
      propertyType: "Apartment",
      bedrooms: 2,
      bathrooms: 1,
      parking: 1,
      features: ["Pet Friendly", "Car Park", "Gym"],
      monthlyRent: 2600.0
    }
  })).check(
    jmesPath("data.createProperty.id").exists(),
    jmesPath("data.createProperty.rentingCompanyId").isEL("#{companyId}")
  )
);

/**
 * Create a company, then create a property for it. `defaults` can be overridden from the CLI
 * with `users=`, `rampDuration=`, `duration=` or replaced entirely with `profile=`.
 */
export const rentingAppGraphqlSimulation = (targetName: string, defaults: RentingAppLoad) =>
  simulation((setUp) => {
    const target = getTarget(targetName);

    const flow = scenario(defaults.name)
      .exec(initUser, createRentingCompany, exitHereIfFailed())
      .pause(1) // simulate real user thinking time
      .exec(createProperty);

    const users = numberParam("users", defaults.users);
    const rampDuration = intParam("rampDuration", defaults.rampDuration);
    const steady = constantUsersPerSec(users).during(intParam("duration", defaults.duration));
    const injection = param("profile", "")
      ? injectionProfile()
      : rampDuration > 0
        ? [rampUsersPerSec(1).to(users).during(rampDuration), steady]
        : [steady];

    setUp(flow.injectOpen(...injection).protocols(httpProtocolFor(target)))
      .assertions(...defaultAssertions())
      .maxDuration(intParam("maxDuration", 4 * 3600));
  });
