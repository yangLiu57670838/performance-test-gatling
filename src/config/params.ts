import { getEnvironmentVariable, getParameter } from "@gatling.io/core";

/**
 * Resolves a setting from, in order of precedence:
 *   1. a CLI parameter:        `npx gatling run ... users=50`
 *   2. an environment variable: `USERS=50 npx gatling run ...`
 *   3. the provided default
 */
export const param = (name: string, defaultValue: string): string => {
  const envName = name
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toUpperCase();
  return getParameter(name) ?? getEnvironmentVariable(envName) ?? defaultValue;
};

export const intParam = (name: string, defaultValue: number): number => {
  const raw = param(name, String(defaultValue));
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value)) {
    throw new Error(`Parameter "${name}" must be an integer, got "${raw}"`);
  }
  return value;
};

export const numberParam = (name: string, defaultValue: number): number => {
  const raw = param(name, String(defaultValue));
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Parameter "${name}" must be a number, got "${raw}"`);
  }
  return value;
};

export const listParam = (name: string, defaultValue: string[]): string[] =>
  param(name, defaultValue.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
