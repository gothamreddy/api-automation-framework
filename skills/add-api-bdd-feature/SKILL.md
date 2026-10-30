---
name: add-api-bdd-feature
description: >-
  Creates Gherkin feature files, Playwright-BDD step definitions, assertion
  helpers in src/assertions/, and shared utils for this API automation framework.
  Use when adding new API scenarios, domain tests, step definitions, assertions,
  or when the user asks to scaffold BDD tests for an endpoint or resource.
---

# Add API BDD Feature (Playwright-BDD)

Portable skill for this repo (`skills/add-api-bdd-feature/`). Works with any agent that can read markdown—no Cursor-specific paths required.

Follow this workflow for **every** new API test area. Do not use Cucumber's runner or a custom Gherkin runner—only `playwright-bdd` (`bddgen` → generated specs → `playwright test`).

## Before writing code

Collect (ask if missing):

1. **Domain name** (e.g. `users`, `orders`) → folder `features/<domain>/`
2. **Endpoints** (method, path, auth required?)
3. **Expected status codes** and key response fields
4. **Tags**: `@smoke`, `@regression`, `@negative`, `@auth`, `@contract`, plus Allure `@epic:`, `@feature:`, `@story:`, `@severity:`
5. **Service name** if not the default `api` (must exist in `framework.config.json` `services`)
6. Whether logic belongs in **existing** steps (`steps/common.steps.ts`, `auth.steps.ts`, `contract.steps.ts`) or new domain steps

Prefer **reusing existing steps** in feature files before adding new step text.

## File placement

| Artifact | Location |
|----------|----------|
| Feature | `features/<domain>/<name>.feature` |
| Domain steps | `steps/<domain>.steps.ts` |
| Reusable assertions | `src/assertions/<domain>.assertions.ts` (export via `src/assertions/index.ts`) |
| Shared non-step helpers | `src/utils/` or `src/data/` |
| Zod schemas | `src/schemas/<resource>.schema.ts` + register in `src/schemas/index.ts` |
| OpenAPI paths (contract) | extend `specs/openapi.yaml` when `@contract` is used |

Steps **must** import `{ Given, When, Then }` from `./fixtures.js` only.

## Workflow checklist

```
- [ ] 1. List existing steps: npx bddgen export
- [ ] 2. Write .feature using existing steps where possible
- [ ] 3. Add Zod schema(s) if using "match schema {string}"
- [ ] 4. Add src/assertions/*.ts for reusable Then logic
- [ ] 5. Add steps/<domain>.steps.ts (thin wrappers → assertions / apiClient)
- [ ] 6. Update specs/openapi.yaml if @contract scenarios added
- [ ] 7. Run: npm run bddgen (fix missing step snippets)
- [ ] 8. Run: npm test -- <qa|stage|val>
```

## Feature file rules

- One **Feature** per file; group by business domain under `features/<domain>/`.
- Use **Background** for shared `Given` (headers, auth) when 2+ scenarios need it.
- Use **Scenario Outline** + **Examples** for parameterized paths/inputs.
- Use `{variable}` in paths/bodies only after `I save response field ... as ...`.
- Quote OpenAPI step paths/methods: `for "POST" "/posts"` (two string params).
- Named services: `When I send a GET request to "/v1/items" on "payments"` or `Given I use the "auth" service`.
- Auth: `Given I am authenticated as "admin"` then call the default or named service. Legacy aliases: `for auth API`, `auth path`.

Template: see [templates.md](templates.md).

## Step definition rules

- **When** steps call `apiClient.send()`; read `world` for last response.
- **Then** steps call functions from `src/assertions/`—keep steps one line when possible.
- Use fixtures: `{ world, apiClient, tokenProvider, openApiValidator, $tags }`.
- Domain-specific **Given** for test data: set `world.headers`, `world.variables`, or factories in `src/data/`.

Template: see [templates.md](templates.md).

## Assertions folder

- Put **Playwright `expect` and Zod checks** in `src/assertions/`, not duplicated across step files.
- Reuse `src/assertions/response.assertions.ts` for status, field equals, schema, timing, save field.
- Add domain file e.g. `src/assertions/users.assertions.ts` for multi-field or business rules.
- Re-export new modules from `src/assertions/index.ts`.
- Register Zod with `registerSchemas({ User: userSchema })` in `src/schemas/index.ts`.

## Common methods

Add to `src/utils/` when used by multiple domains:

- HTTP parsing → `src/utils/http.helpers.ts` (`parseHttpMethod`, `parseJsonDocString`, `dataTableToQuery`)
- JSON paths → `src/utils/jsonPath.ts`
- Interpolation → `src/utils/interpolate.ts`
- Test data → `src/data/<resource>Factory.ts`

Add to `src/clients/` only when a resource client reduces repetition across many scenarios.

## Verification

```bash
npm run bddgen          # must exit 0 (no missing steps)
npm test -- qa          # or stage / val
npm run test:smoke -- qa  # if tagged @smoke
```

## Examples

End-to-end sample: [examples.md](examples.md).
