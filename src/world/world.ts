import type { APIResponse } from '@playwright/test';

export type AuthOverride = 'none' | 'expired' | 'malformed' | undefined;

export class World {
  lastResponse?: APIResponse;
  lastResponseTimeMs = 0;
  lastResponseBody: unknown;
  variables: Record<string, string> = {};
  headers: Record<string, string> = {};
  authenticatedRole?: string;
  authOverride: AuthOverride;
  lastRequestBody?: unknown;
  lastRequestMethod?: string;
  lastRequestPath?: string;
  lastRequestService?: string;
  /** Named service from framework.config.json (default: api) */
  service?: string;
  /** When set, overrides the named-service base URL for this scenario */
  requestBaseUrl?: string;

  resetRequestState(): void {
    this.headers = {};
    this.authOverride = undefined;
    this.requestBaseUrl = undefined;
    this.service = undefined;
  }
}
