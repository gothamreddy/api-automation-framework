---
name: adapt-framework
description: >-
  Adapts this Playwright-BDD API framework to a different product or API.
  Use when cloning the repo for a new project, pointing tests at a real backend,
  changing environments, adding named services, or removing sample JSONPlaceholder tests.
---

# Adapt this framework to another project

Change **configuration and samples**, not the core under `src/` (client, auth, contract, assertions).

## Checklist

```
- [ ] 1. Edit framework.config.json (name, environments, services, mockServer)
- [ ] 2. Replace .env.example and .env.<env> with real BASE_URL / auth
- [ ] 3. Set START_MOCK_AUTH=false unless you still need tests-support/auth-server
- [ ] 4. Replace specs/openapi.yaml with the product spec (or drop @contract)
- [ ] 5. Delete sample features (features/posts, features/auth, features/contract)
- [ ] 6. Remove sample Zod schemas (src/schemas/post.schema.ts, user.schema.ts) and unregister them
- [ ] 7. Follow skills/add-api-bdd-feature/SKILL.md to add real domains
- [ ] 8. npm test -- <env>
```

## 1. `framework.config.json`

This is the only project-identity file besides env.

```json
{
  "projectName": "payments-api-tests",
  "environments": ["dev", "sit", "prod"],
  "defaultEnv": "dev",
  "envAliases": { "development": "dev" },
  "services": {
    "api": "BASE_URL",
    "auth": "AUTH_BASE_URL",
    "payments": "PAYMENTS_BASE_URL"
  }
}
```

Omit `mockServer` (or set `START_MOCK_AUTH=false`) when the real IdP/API is used.

Create `.env.dev`, `.env.sit`, `.env.prod` matching `environments`. Run with `npm test -- sit`.

## 2. Auth

| AUTH_TYPE | When to use |
|-----------|-------------|
| `none` | Public APIs; skip `Given I am authenticated...` |
| `oauth2_client_credentials` | Machine tokens |
| `oauth2_password` | Resource owner password |
| `jwt_login` | JSON login body |
| `static_bearer` | Long-lived `STATIC_BEARER_TOKEN` |

Per-role secrets: `OAUTH_CLIENT_ID_ADMIN`, `OAUTH_USERNAME_VIEWER`, etc.

Gherkin against a named service:

```gherkin
Given I am authenticated as "admin"
And I use the "payments" service
When I send a GET request to "/v1/charges"
```

or `When I send a GET request to "/v1/charges" on "payments"`.

## 3. What not to fork

Keep as-is unless you are extending the engine:

- `src/clients/apiClient.ts`
- `src/auth/`
- `src/contract/`
- `src/assertions/response.assertions.ts`
- `steps/fixtures.ts`, `steps/common.steps.ts`, `steps/auth.steps.ts`, `steps/contract.steps.ts`

Add **domain** code only: `features/<domain>/`, `steps/<domain>.steps.ts`, `src/assertions/<domain>.assertions.ts`, `src/schemas/<resource>.schema.ts`.

## 4. Verify

```bash
npm install
npm run bddgen
npm test -- dev
```
