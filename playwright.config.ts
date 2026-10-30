import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { env } from './src/config/env.js';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'steps/**/*.ts',
  outputDir: '.features-gen',
});

const mock = env.framework.mockServer;
const mockBaseUrl = mock ? (process.env[mock.urlEnv] ?? env.AUTH_BASE_URL) : undefined;
const startMock = Boolean(env.START_MOCK_AUTH && mock && mockBaseUrl);

export default defineConfig({
  testDir,
  fullyParallel: true,
  forbidOnly: env.CI,
  retries: env.PW_RETRIES ?? (env.CI ? 2 : 0),
  workers: env.PW_WORKERS ?? (env.CI ? 2 : undefined),
  timeout: env.PW_TIMEOUT ?? 30_000,
  use: {
    baseURL: env.BASE_URL,
    extraHTTPHeaders: env.defaultHeaders,
    ignoreHTTPSErrors: Boolean(env.IGNORE_HTTPS_ERRORS),
    trace: 'off',
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  webServer: startMock
    ? {
        command: mock!.command,
        url: `${mockBaseUrl}${mock!.healthPath}`,
        reuseExistingServer: !env.CI,
        timeout: 120_000,
      }
    : undefined,
  globalSetup: './tests-support/allure-global-setup.ts',
});
