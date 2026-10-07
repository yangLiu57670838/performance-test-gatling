import { param } from "./params";
import { Target } from "./types";

/**
 * Registry of every domain under test. Add a new entry here to make it available
 * to the generic `endpoints` simulation via `targets=<name>`.
 */
const registry: Target[] = [
  {
    name: "local",
    baseUrl: "http://localhost:3000",
    endpoints: [
      { name: "health", method: "GET", path: "/health" },
      { name: "list items", method: "GET", path: "/api/items" },
      { name: "get item", method: "GET", path: "/api/items/1" },
      {
        name: "create item",
        method: "POST",
        path: "/api/items",
        body: { name: "gatling-item", price: 9.99 },
        expectStatus: [201]
      }
    ]
  },
  {
    // Stateful GraphQL flow, see src/rentingAppGraphqlLocalSmoke.gatling.ts
    name: "local-renting-app-graphql",
    baseUrl: "http://localhost:4000",
    endpoints: []
  },
  {
    // No default on purpose: requires PROD_RENTING_APP_GRAPHQL_BASE_URL, see src/rentingAppGraphqlProd.gatling.ts
    name: "prod-renting-app-graphql",
    baseUrl: "",
    endpoints: []
  },
  {
    name: "jsonplaceholder",
    baseUrl: "https://jsonplaceholder.typicode.com",
    endpoints: [
      { name: "list posts", method: "GET", path: "/posts" },
      { name: "get post", method: "GET", path: "/posts/1" },
      { name: "post comments", method: "GET", path: "/posts/1/comments" },
      {
        name: "create post",
        method: "POST",
        path: "/posts",
        body: { title: "gatling", body: "load test", userId: 1 },
        expectStatus: [201]
      }
    ]
  },
  {
    name: "httpbin",
    baseUrl: "https://httpbin.org",
    endpoints: [
      { name: "get", method: "GET", path: "/get" },
      { name: "delay 1s", method: "GET", path: "/delay/1" },
      { name: "post json", method: "POST", path: "/post", body: { hello: "gatling" } }
    ]
  }
];

const envPrefix = (name: string) => name.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();

/** Applies per-target base URL overrides (`localBaseUrl=...` or `LOCAL_BASE_URL=...`). */
const resolve = (target: Target): Target => {
  const baseUrl = param(`${target.name}BaseUrl`, target.baseUrl).replace(/\/$/, "");
  if (!baseUrl) {
    throw new Error(
      `Target "${target.name}" has no base URL. Set ${envPrefix(target.name)}_BASE_URL=https://...`
    );
  }
  return {
    ...target,
    baseUrl,
    bearerTokenEnv: target.bearerTokenEnv ?? `${envPrefix(target.name)}_TOKEN`
  };
};

export const targetNames = (): string[] => registry.map((t) => t.name);

export const getTarget = (name: string): Target => {
  const target = registry.find((t) => t.name === name);
  if (!target) {
    throw new Error(`Unknown target "${name}". Available targets: ${targetNames().join(", ")}`);
  }
  return resolve(target);
};

export const getTargets = (names: string[]): Target[] => names.map(getTarget);
