import { ChainBuilder, exec, StringBody } from "@gatling.io/core";
import { http, HttpRequestActionBuilder, status } from "@gatling.io/http";
import { Endpoint } from "../config/types";

export const requestFor = (endpoint: Endpoint): HttpRequestActionBuilder => {
  const req = http(endpoint.name);
  let builder: HttpRequestActionBuilder;
  switch (endpoint.method) {
    case "GET":
      builder = req.get(endpoint.path);
      break;
    case "POST":
      builder = req.post(endpoint.path);
      break;
    case "PUT":
      builder = req.put(endpoint.path);
      break;
    case "PATCH":
      builder = req.patch(endpoint.path);
      break;
    case "DELETE":
      builder = req.delete(endpoint.path);
      break;
  }

  if (endpoint.headers) {
    builder = builder.headers(endpoint.headers);
  }

  if (endpoint.body !== undefined) {
    const body = typeof endpoint.body === "string" ? endpoint.body : JSON.stringify(endpoint.body);
    builder = builder.body(StringBody(body)).asJson();
  }

  const [first, ...rest] = endpoint.expectStatus ?? [200];
  return builder.check(status().in(first, ...rest));
};

/** Executes every endpoint in order, with a short think time between calls. */
export const chainFor = (endpoints: Endpoint[], thinkTimeSeconds = 1): ChainBuilder => {
  if (endpoints.length === 0) {
    throw new Error("chainFor requires at least one endpoint");
  }
  const [first, ...rest] = endpoints.map((e) => exec(requestFor(e)).pause(0, thinkTimeSeconds));
  return exec(first, ...rest);
};
