import { Given, Then } from './fixtures.js';
import { assertTokenClaim } from '../src/index.js';

Given('I am authenticated as {string}', async ({ world, tokenProvider }, role) => {
  world.authenticatedRole = role;
  world.authOverride = undefined;
  await tokenProvider.getToken(role);
});

Given('I am not authenticated', async ({ world }) => {
  world.authenticatedRole = undefined;
  world.authOverride = 'none';
});

Given('I use an expired token', async ({ world }) => {
  world.authenticatedRole = world.authenticatedRole ?? 'admin';
  world.authOverride = 'expired';
});

Given('I use a malformed token', async ({ world }) => {
  world.authenticatedRole = world.authenticatedRole ?? 'admin';
  world.authOverride = 'malformed';
});

Given('I am authenticated as {string} for {string} service', async ({ world, tokenProvider }, role, service) => {
  world.authenticatedRole = role;
  world.authOverride = undefined;
  world.service = service;
  await tokenProvider.getToken(role);
});

Given('I am authenticated as {string} for auth API', async ({ world, tokenProvider }, role) => {
  world.authenticatedRole = role;
  world.authOverride = undefined;
  world.service = 'auth';
  await tokenProvider.getToken(role);
});

Then(
  'the access token should contain claim {string} with value {string}',
  async ({ world, tokenProvider }, claim, expected) => {
    const role = world.authenticatedRole ?? 'admin';
    const token = await tokenProvider.getToken(role);
    assertTokenClaim(token, claim, expected);
  },
);
