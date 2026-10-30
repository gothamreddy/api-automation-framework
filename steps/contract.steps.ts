import * as allure from 'allure-js-commons';
import { Then } from './fixtures.js';
import { safeJsonStringify } from '../src/utils/masking.js';

Then('the response should conform to the OpenAPI spec', async ({ world, openApiValidator }) => {
  const method = world.lastRequestMethod ?? 'GET';
  const path = world.lastRequestPath ?? '/';
  const status = world.lastResponse?.status() ?? 0;
  try {
    openApiValidator.validateResponse(method, path, status, world.lastResponseBody);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await allure.attachment('Contract validation errors', safeJsonStringify({ error: message }), 'application/json');
    throw err;
  }
});

Then(
  'the request body should be valid against the OpenAPI spec for {string} {string}',
  async ({ world, openApiValidator }, method, pathTemplate) => {
    try {
      openApiValidator.validateRequestBody(method, pathTemplate, world.lastRequestBody);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await allure.attachment('Contract validation errors', safeJsonStringify({ error: message }), 'application/json');
      throw err;
    }
  },
);
