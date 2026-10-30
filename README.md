# Playwright-BDD API Test Framework

Reusable TypeScript API test harness: Gherkin → `bddgen` → `playwright test`. Point it at any HTTP API by editing [`framework.config.json`](framework.config.json) and `.env.<env>` files.

## Prerequisites

- Node.js 20+
- Java 8+ (Allure CLI)

## Setup

```bash
npm install
npx playwright install
cp .env.example .env
```

Env load order: `.env`, then `.env.<ENV>`. Allowed `ENV` values come from `framework.config.json` (this sample: **qa**, **stage**, **val**).

## Adapt to another API

See **[`skills/adapt-framework/SKILL.md`](skills/adapt-framework/SKILL.md)**. Short version:

1. Set `environments` and `services` in `framework.config.json`
2. Put real `BASE_URL` (and extra service URLs) in `.env.<env>`
3. Set `AUTH_TYPE` (`none` if no auth) and `START_MOCK_AUTH=false` for real backends
4. Replace `specs/openapi.yaml` and delete `features/posts`, `features/auth`, `features/contract`
5. Add product tests with [`skills/add-api-bdd-feature/SKILL.md`](skills/add-api-bdd-feature/SKILL.md)

## Running tests

```bash
npm test                      # defaultEnv from framework.config.json
npm test -- stage             # or: npm test -- --env val
npm run test:smoke -- qa
npm run test:contract -- val
ENV=stage npm test
```

Reports: `npm run report` · `npm run allure:generate` · `npm run allure:open`

## Configuration

| Knob | Where |
|------|--------|
| Env names, named services, mock server | [`framework.config.json`](framework.config.json) |
| URLs, auth, timeouts | `.env.<env>` — see [`.env.example`](.env.example) |
| OpenAPI path | `OPENAPI_SPEC_PATH` |

**Services:** map a Gherkin name to an env URL, e.g. `"payments": "PAYMENTS_BASE_URL"`, then `When I send a GET request to "/charges" on "payments"`.

**Auth types:** `none` · `oauth2_client_credentials` · `oauth2_password` · `jwt_login` · `static_bearer`

This sample starts a local mock IdP (`START_MOCK_AUTH=true`). Turn it off for real environments.

## Writing tests

- Features: `features/<domain>/*.feature`
- Steps: import `Given/When/Then` from `steps/fixtures.ts`
- Reuse `steps/common.steps.ts`; put checks in `src/assertions/`; register Zod in `src/schemas/index.ts`
- Tags: `@smoke` `@regression` `@contract` `@auth` `@negative` plus Allure `@epic:` `@feature:` `@story:` `@severity:`

Sample suite (JSONPlaceholder + mock auth) lives under `features/` and can be deleted when you onboard a real API.

## Layout

```
framework.config.json   # project adapter (envs + services)
features/               # Gherkin (replace samples)
steps/                  # BDD glue (keep common/auth/contract)
src/                    # reusable engine
specs/                  # OpenAPI
tests-support/          # optional mock auth + Allure setup
skills/                 # agent workflows (any tool)
```

## Agent skills

[`skills/README.md`](skills/README.md) · [`AGENTS.md`](AGENTS.md)

- [add-api-bdd-feature](skills/add-api-bdd-feature/SKILL.md) — new domain tests
- [adapt-framework](skills/adapt-framework/SKILL.md) — reuse this repo on another API
