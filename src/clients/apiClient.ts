import type { APIRequestContext, APIResponse } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { env, getServiceUrl } from '../config/env.js';
import type { TokenProvider } from '../auth/tokenProvider.js';
import type { HttpMethod } from '../utils/http.helpers.js';
import { interpolate } from '../utils/interpolate.js';
import { maskHeaders, safeJsonStringify } from '../utils/masking.js';
import type { World } from '../world/world.js';

export type { HttpMethod };

export interface ApiRequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string>;
  service?: string;
}

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly world: World,
    private readonly tokenProvider: TokenProvider,
  ) {}

  async send(options: ApiRequestOptions): Promise<APIResponse> {
    const path = interpolate(options.path, this.world.variables);
    const service = options.service ?? this.world.service ?? 'api';
    const baseURL = this.world.requestBaseUrl ?? getServiceUrl(service);
    const url = resolveUrl(path, baseURL);

    let body = options.body;
    if (typeof body === 'string') {
      body = interpolate(body, this.world.variables);
      try {
        body = JSON.parse(body as string);
      } catch {
        /* keep as string */
      }
    } else if (body && typeof body === 'object') {
      body = JSON.parse(interpolate(JSON.stringify(body), this.world.variables));
    }

    const headers: Record<string, string> = { ...env.defaultHeaders };
    for (const [key, value] of Object.entries(this.world.headers)) {
      headers[key] = interpolate(value, this.world.variables);
    }

    const authHeader = await this.resolveAuthorization();
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    this.world.lastRequestMethod = options.method;
    this.world.lastRequestPath = path;
    this.world.lastRequestBody = body;
    this.world.lastRequestService = service;

    const start = Date.now();

    return await allure.step(`HTTP ${options.method} ${path}`, async () => {
      await allure.attachment(
        'Request',
        safeJsonStringify({
          method: options.method,
          service,
          url,
          headers: maskHeaders(headers),
          query: options.query,
          body,
        }),
        'application/json',
      );

      const response = await this.request.fetch(url, {
        method: options.method,
        headers,
        params: options.query,
        data: body,
        timeout: env.PW_TIMEOUT,
      });

      const durationMs = Date.now() - start;
      this.world.lastResponseTimeMs = durationMs;
      this.world.lastResponse = response;

      let responseBody: unknown;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = await response.text();
      }
      this.world.lastResponseBody = responseBody;

      await allure.attachment(
        'Response',
        safeJsonStringify({
          status: response.status(),
          headers: maskHeaders(Object.fromEntries(Object.entries(response.headers()))),
          body: responseBody,
          durationMs,
        }),
        'application/json',
      );

      return response;
    });
  }

  private async resolveAuthorization(): Promise<string | undefined> {
    if (this.world.authOverride === 'none') {
      return undefined;
    }
    if (this.world.authOverride === 'expired') {
      return 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjE2MDAwMDAwMDB9.expired';
    }
    if (this.world.authOverride === 'malformed') {
      return 'Bearer not-a-valid-jwt';
    }
    if (!this.world.authenticatedRole) {
      return undefined;
    }
    const token = await this.tokenProvider.getToken(this.world.authenticatedRole);
    return `Bearer ${token}`;
  }
}

function resolveUrl(path: string, baseURL: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return new URL(path, baseURL.endsWith('/') ? baseURL : `${baseURL}/`).toString();
}
