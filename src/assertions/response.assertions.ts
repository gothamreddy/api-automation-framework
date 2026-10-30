import { expect } from '@playwright/test';
import type { APIResponse } from '@playwright/test';
import { getSchemaByName } from '../schemas/index.js';
import { getByPath } from '../utils/jsonPath.js';

export function assertStatus(response: APIResponse | undefined, expected: number): void {
  expect(response?.status()).toBe(expected);
}

export function assertBodyFieldEquals(body: unknown, field: string, expected: string): void {
  const actual = getByPath(body, field);
  expect(String(actual)).toBe(expected);
}

export function assertBodyMatchesSchema(body: unknown, schemaName: string): void {
  const schema = getSchemaByName(schemaName);
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(`Schema "${schemaName}" validation failed:\n${result.error.toString()}`);
  }
}

export function assertResponseTimeUnder(durationMs: number, maxMs: number): void {
  expect(durationMs).toBeLessThan(maxMs);
}

export function saveResponseField(
  body: unknown,
  field: string,
  variables: Record<string, string>,
  variableName: string,
): void {
  const value = getByPath(body, field);
  if (value === undefined || value === null) {
    throw new Error(`Cannot save field "${field}": value is ${String(value)}`);
  }
  variables[variableName] = String(value);
}
