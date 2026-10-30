import { test as base, createBdd } from 'playwright-bdd';
import {
  ApiClient,
  createTokenProvider,
  OpenApiValidator,
  World,
  type TokenProvider,
} from '../src/index.js';
import { mapTagsToAllure } from '../src/utils/allureTags.js';

export const test = base.extend<{
  world: World;
  tokenProvider: TokenProvider;
  openApiValidator: OpenApiValidator;
  apiClient: ApiClient;
  allureLabels: void;
}>({
  world: async ({}, use) => {
    await use(new World());
  },

  tokenProvider: [
    async ({}, use) => {
      await use(createTokenProvider());
    },
    { scope: 'worker' },
  ],

  openApiValidator: [
    async ({}, use) => {
      await use(await OpenApiValidator.load());
    },
    { scope: 'worker' },
  ],

  apiClient: async ({ request, world, tokenProvider }, use) => {
    await use(new ApiClient(request, world, tokenProvider));
  },

  allureLabels: [
    async ({ $tags }, use) => {
      mapTagsToAllure($tags);
      await use();
    },
    { auto: true },
  ],
});

export const { Given, When, Then } = createBdd(test);
