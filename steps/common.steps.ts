import { Given, Then, When } from './fixtures.js';
import {
  assertBodyFieldEquals,
  assertBodyMatchesSchema,
  assertResponseTimeUnder,
  assertStatus,
  dataTableToQuery,
  parseHttpMethod,
  parseJsonDocString,
  saveResponseField,
} from '../src/index.js';

Given('the request header {string} is {string}', async ({ world }, name, value) => {
  world.headers[name] = value;
});

Given('I set variable {string} to {string}', async ({ world }, name, value) => {
  world.variables[name] = value;
});

Given('I use the {string} service', async ({ world }, service) => {
  world.service = service;
  world.requestBaseUrl = undefined;
});

When('I send a {word} request to {string}', async ({ apiClient }, method, path) => {
  await apiClient.send({ method: parseHttpMethod(method), path });
});

When(
  'I send a {word} request to {string} on {string}',
  async ({ apiClient }, method, path, service) => {
    await apiClient.send({ method: parseHttpMethod(method), path, service });
  },
);

When(
  'I send a {word} request to {string} with body:',
  async ({ apiClient }, method, path, docString: string) => {
    await apiClient.send({
      method: parseHttpMethod(method),
      path,
      body: parseJsonDocString(docString),
    });
  },
);

When(
  'I send a {word} request to {string} with query params:',
  async ({ apiClient }, method, path, dataTable) => {
    await apiClient.send({
      method: parseHttpMethod(method),
      path,
      query: dataTableToQuery(dataTable.rows()),
    });
  },
);

When('I send a {word} request to auth path {string}', async ({ apiClient }, method, path) => {
  await apiClient.send({
    method: parseHttpMethod(method),
    path,
    service: 'auth',
  });
});

Then('the response status should be {int}', async ({ world }, status) => {
  assertStatus(world.lastResponse, status);
});

Then('the response body field {string} should equal {string}', async ({ world }, field, expected) => {
  assertBodyFieldEquals(world.lastResponseBody, field, expected);
});

Then('the response body should match schema {string}', async ({ world }, schemaName) => {
  assertBodyMatchesSchema(world.lastResponseBody, schemaName);
});

Then('the response time should be under {int} ms', async ({ world }, maxMs) => {
  assertResponseTimeUnder(world.lastResponseTimeMs, maxMs);
});

Then('I save response field {string} as {string}', async ({ world }, field, variableName) => {
  saveResponseField(world.lastResponseBody, field, world.variables, variableName);
});
