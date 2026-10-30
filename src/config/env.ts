import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { loadFrameworkConfig, resolveTargetEnv, type FrameworkConfig } from './frameworkConfig.js';

const authTypeSchema = z.enum([
  'none',
  'oauth2_client_credentials',
  'oauth2_password',
  'jwt_login',
  'static_bearer',
]);

const envSchema = z.object({
  ENV: z.string(),
  BASE_URL: z.string().url(),
  AUTH_BASE_URL: z.string().url().optional(),
  AUTH_TYPE: authTypeSchema.default('none'),
  OAUTH_TOKEN_URL: z.string().url().optional(),
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  OAUTH_USERNAME: z.string().optional(),
  OAUTH_PASSWORD: z.string().optional(),
  JWT_LOGIN_URL: z.string().url().optional(),
  STATIC_BEARER_TOKEN: z.string().optional(),
  CONTRACT_STRICT: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  OPENAPI_SPEC_PATH: z.string().default('specs/openapi.yaml'),
  START_MOCK_AUTH: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  IGNORE_HTTPS_ERRORS: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  DEFAULT_HEADERS: z.string().optional(),
  PW_RETRIES: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined)),
  PW_WORKERS: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined)),
  PW_TIMEOUT: z
    .string()
    .optional()
    .transform((v) => (v ? Number.parseInt(v, 10) : undefined)),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CI: z.boolean().default(false),
});

export type AuthType = z.infer<typeof authTypeSchema>;
export type Env = z.infer<typeof envSchema> & {
  services: Record<string, string>;
  defaultHeaders: Record<string, string>;
  framework: FrameworkConfig;
};

function loadEnvFiles(config: FrameworkConfig): void {
  const root = process.cwd();
  loadDotenv({ path: resolve(root, '.env') });
  const envName = resolveTargetEnv(process.env.ENV, config);
  process.env.ENV = envName;
  const envFile = resolve(root, `.env.${envName}`);
  if (existsSync(envFile)) {
    loadDotenv({ path: envFile, override: true });
  }
}

function parseDefaultHeaders(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) {
    return { Accept: 'application/json' };
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return { Accept: 'application/json', ...parsed };
  } catch {
    throw new Error('DEFAULT_HEADERS must be a JSON object, e.g. {"X-Api-Key":"demo"}');
  }
}

function resolveServices(config: FrameworkConfig): Record<string, string> {
  const services: Record<string, string> = {};
  for (const [name, envKey] of Object.entries(config.services)) {
    const value = process.env[envKey];
    if (value) {
      services[name] = value;
    }
  }
  return services;
}

const framework = loadFrameworkConfig();
loadEnvFiles(framework);

const parsed = envSchema.safeParse({
  ...process.env,
  CI: process.env.CI === 'true' || process.env.CI === '1',
});

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error(
    'Environment validation failed. Set BASE_URL in .env.<ENV> and copy .env.example.',
  );
}

const services = resolveServices(framework);
if (!services.api && parsed.data.BASE_URL) {
  services.api = parsed.data.BASE_URL;
}

export const env: Env = Object.freeze({
  ...parsed.data,
  services,
  defaultHeaders: parseDefaultHeaders(parsed.data.DEFAULT_HEADERS),
  framework,
});

export function getServiceUrl(name = 'api'): string {
  const url = env.services[name];
  if (url) return url;
  if (name === 'api') return env.BASE_URL;
  const envKey = env.framework.services[name];
  throw new Error(
    `Unknown or unconfigured service "${name}". Add it to framework.config.json services` +
      (envKey ? ` and set ${envKey} in .env.${env.ENV}` : ''),
  );
}

export function getOAuthCredentialsForRole(role: string): {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
} {
  const roleKey = role.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  return {
    clientId: process.env[`OAUTH_CLIENT_ID_${roleKey}`] ?? env.OAUTH_CLIENT_ID ?? '',
    clientSecret: process.env[`OAUTH_CLIENT_SECRET_${roleKey}`] ?? env.OAUTH_CLIENT_SECRET ?? '',
    username: process.env[`OAUTH_USERNAME_${roleKey}`] ?? env.OAUTH_USERNAME,
    password: process.env[`OAUTH_PASSWORD_${roleKey}`] ?? env.OAUTH_PASSWORD,
  };
}

export function getEnvVar(key: string): string | undefined {
  return process.env[key];
}
