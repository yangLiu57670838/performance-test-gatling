import {
  atOnceUsers,
  constantUsersPerSec,
  nothingFor,
  OpenInjectionStep,
  rampUsersPerSec
} from "@gatling.io/core";
import { intParam, param } from "./params";

export type ProfileName = "smoke" | "load" | "stress" | "spike" | "soak";

/**
 * Open-model injection profiles. Every profile can be tuned from the CLI:
 *   profile=load users=20 duration=120 rampDuration=30
 * `users` is the arrival rate (new users per second) except for `smoke`, where it is a total count.
 */
const profiles: Record<ProfileName, () => OpenInjectionStep[]> = {
  smoke: () => [atOnceUsers(intParam("users", 1))],

  load: () => {
    const rate = intParam("users", 10);
    return [
      rampUsersPerSec(1).to(rate).during(intParam("rampDuration", 30)),
      constantUsersPerSec(rate).during(intParam("duration", 60))
    ];
  },

  stress: () => {
    const rate = intParam("users", 50);
    return [
      rampUsersPerSec(1).to(rate).during(intParam("rampDuration", 120)),
      constantUsersPerSec(rate).during(intParam("duration", 120))
    ];
  },

  spike: () => {
    const rate = intParam("users", 100);
    return [
      constantUsersPerSec(2).during(30),
      atOnceUsers(rate),
      nothingFor(10),
      constantUsersPerSec(2).during(30)
    ];
  },

  soak: () => {
    const rate = intParam("users", 5);
    return [
      rampUsersPerSec(1).to(rate).during(intParam("rampDuration", 60)),
      constantUsersPerSec(rate).during(intParam("duration", 3600))
    ];
  }
};

export const profileName = (): ProfileName => {
  const name = param("profile", "smoke");
  if (!(name in profiles)) {
    throw new Error(
      `Unknown profile "${name}". Available profiles: ${Object.keys(profiles).join(", ")}`
    );
  }
  return name as ProfileName;
};

export const injectionProfile = (): OpenInjectionStep[] => profiles[profileName()]();
