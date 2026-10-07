export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface Endpoint {
  /** Request name as shown in the Gatling report. */
  name: string;
  method: HttpMethod;
  /** Path relative to the target's baseUrl. Supports Gatling EL, e.g. `/users/#{userId}`. */
  path: string;
  /** JSON body for POST/PUT/PATCH. Strings are sent as-is and support Gatling EL. */
  body?: unknown;
  headers?: Record<string, string>;
  /** Accepted status codes. Defaults to 200. */
  expectStatus?: number[];
}

export interface Target {
  /** Key used to select this target from the CLI, e.g. `targets=local`. */
  name: string;
  /** Default base URL; override with `<NAME>_BASE_URL` env var or `<name>BaseUrl=` parameter. */
  baseUrl: string;
  headers?: Record<string, string>;
  /** If set, the value of this env var is sent as `Authorization: Bearer <value>`. */
  bearerTokenEnv?: string;
  endpoints: Endpoint[];
}
