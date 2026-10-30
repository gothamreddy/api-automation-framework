import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from '../src/config/env.js';

export default async function globalSetup(): Promise<void> {
  const dir = resolve(process.cwd(), 'allure-results');
  mkdirSync(dir, { recursive: true });
  const lines = [
    `ENV=${env.ENV}`,
    `PROJECT=${env.framework.projectName}`,
    `BASE_URL=${env.BASE_URL}`,
    `AUTH_TYPE=${env.AUTH_TYPE}`,
    `AUTH_BASE_URL=${env.AUTH_BASE_URL ?? ''}`,
    `START_MOCK_AUTH=${String(Boolean(env.START_MOCK_AUTH))}`,
  ];
  writeFileSync(resolve(dir, 'environment.properties'), lines.join('\n'), 'utf8');
}
