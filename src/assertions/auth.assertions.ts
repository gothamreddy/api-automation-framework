import { expect } from '@playwright/test';
import { decodeTokenClaims } from '../auth/tokenCache.js';

export function assertTokenClaim(token: string, claim: string, expected: string): void {
  const claims = decodeTokenClaims(token);
  expect(claims, 'access token could not be decoded').not.toBeNull();
  expect(String(claims![claim])).toBe(expected);
}
