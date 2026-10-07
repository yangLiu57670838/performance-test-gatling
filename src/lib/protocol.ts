import { getEnvironmentVariable } from "@gatling.io/core";
import { http, HttpProtocolBuilder } from "@gatling.io/http";
import { Target } from "../config/types";

export const httpProtocolFor = (target: Target): HttpProtocolBuilder => {
  let protocol = http
    .baseUrl(target.baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("gatling-performance-test");

  if (target.headers) {
    protocol = protocol.headers(target.headers);
  }

  const token = target.bearerTokenEnv ? getEnvironmentVariable(target.bearerTokenEnv) : undefined;
  if (token) {
    protocol = protocol.authorizationHeader(`Bearer ${token}`);
  }

  return protocol;
};
