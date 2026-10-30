import { request } from '@playwright/test';
import { env, getOAuthCredentialsForRole } from '../config/env.js';
import { decodeTokenClaims, TokenCache } from './tokenCache.js';

export interface TokenProvider {
  getToken(role: string): Promise<string>;
  invalidate(role?: string): void;
  getDecodedClaims(role: string): Record<string, unknown> | null;
}

const workerCache = new TokenCache();

export function createTokenProvider(): TokenProvider {
  switch (env.AUTH_TYPE) {
    case 'none':
      return new NoneTokenProvider();
    case 'oauth2_client_credentials':
      return new OAuth2ClientCredentialsProvider(workerCache);
    case 'oauth2_password':
      return new OAuth2PasswordProvider(workerCache);
    case 'jwt_login':
      return new JwtLoginProvider(workerCache);
    case 'static_bearer':
      return new StaticBearerProvider(workerCache);
    default:
      throw new Error(`Unsupported AUTH_TYPE: ${env.AUTH_TYPE}`);
  }
}

class NoneTokenProvider implements TokenProvider {
  async getToken(_role: string): Promise<string> {
    throw new Error('AUTH_TYPE=none. Set AUTH_TYPE and token URLs in .env.<ENV> to authenticate.');
  }
  invalidate(): void {}
  getDecodedClaims(): Record<string, unknown> | null {
    return null;
  }
}

abstract class BaseTokenProvider implements TokenProvider {
  constructor(protected readonly cache: TokenCache) {}

  abstract fetchToken(role: string): Promise<{ accessToken: string; expiresIn?: number }>;

  async getToken(role: string): Promise<string> {
    const cached = this.cache.get(role);
    if (cached) return cached.token;
    const { accessToken, expiresIn } = await this.fetchToken(role);
    this.cache.set(role, accessToken, expiresIn);
    return accessToken;
  }

  invalidate(role?: string): void {
    this.cache.invalidate(role);
  }

  getDecodedClaims(role: string): Record<string, unknown> | null {
    const token = this.cache.getToken(role);
    if (!token) return null;
    return decodeTokenClaims(token);
  }
}

async function postForToken(
  url: string,
  options: { form?: Record<string, string>; data?: unknown },
): Promise<{ accessToken: string; expiresIn?: number }> {
  const ctx = await request.newContext({ ignoreHTTPSErrors: env.IGNORE_HTTPS_ERRORS });
  try {
    const response = await ctx.post(url, options);
    if (!response.ok()) {
      const text = await response.text();
      throw new Error(`Token request failed (${response.status()}) ${url}: ${text}`);
    }
    const body = (await response.json()) as { access_token?: string; expires_in?: number };
    if (!body.access_token) {
      throw new Error(`Token response from ${url} is missing access_token`);
    }
    return { accessToken: body.access_token, expiresIn: body.expires_in };
  } finally {
    await ctx.dispose();
  }
}

class OAuth2ClientCredentialsProvider extends BaseTokenProvider {
  async fetchToken(role: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const { clientId, clientSecret } = getOAuthCredentialsForRole(role);
    const tokenUrl = env.OAUTH_TOKEN_URL ?? `${env.AUTH_BASE_URL ?? ''}/oauth/token`;
    if (!tokenUrl.startsWith('http')) {
      throw new Error('OAUTH_TOKEN_URL or AUTH_BASE_URL is required for oauth2_client_credentials');
    }
    return postForToken(tokenUrl, {
      form: {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        role,
      },
    });
  }
}

class OAuth2PasswordProvider extends BaseTokenProvider {
  async fetchToken(role: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const { clientId, clientSecret, username, password } = getOAuthCredentialsForRole(role);
    const tokenUrl = env.OAUTH_TOKEN_URL ?? `${env.AUTH_BASE_URL ?? ''}/oauth/token`;
    if (!tokenUrl.startsWith('http')) {
      throw new Error('OAUTH_TOKEN_URL or AUTH_BASE_URL is required for oauth2_password');
    }
    return postForToken(tokenUrl, {
      form: {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username: username ?? role,
        password: password ?? 'password',
        role,
      },
    });
  }
}

class JwtLoginProvider extends BaseTokenProvider {
  async fetchToken(role: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const loginUrl = env.JWT_LOGIN_URL ?? `${env.AUTH_BASE_URL ?? ''}/auth/login`;
    if (!loginUrl.startsWith('http')) {
      throw new Error('JWT_LOGIN_URL or AUTH_BASE_URL is required for jwt_login');
    }
    const { username, password } = getOAuthCredentialsForRole(role);
    return postForToken(loginUrl, {
      data: {
        username: username ?? role,
        password: password ?? 'password',
        role,
      },
    });
  }
}

class StaticBearerProvider extends BaseTokenProvider {
  async fetchToken(_role: string): Promise<{ accessToken: string; expiresIn?: number }> {
    const token = env.STATIC_BEARER_TOKEN;
    if (!token) {
      throw new Error('STATIC_BEARER_TOKEN is required when AUTH_TYPE=static_bearer');
    }
    return { accessToken: token, expiresIn: 3600 };
  }
}
