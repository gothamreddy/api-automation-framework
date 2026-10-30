# Example: add GET /users/{id} tests

## 1. Check existing steps

```bash
npx bddgen export
```

Reuse: `When I send a GET request to {string}`, `Then the response status should be {int}`, etc.

## 2. Feature file

`features/users/get-user.feature`:

```gherkin
@epic:Users @feature:Read @smoke @regression
Feature: Get user by id

  @story:GetUserById @severity:critical
  Scenario: Retrieve user 1
    When I send a GET request to "/users/1"
    Then the response status should be 200
    And the response body field "id" should equal "1"
    And the response body should match schema "User"
```

No new steps required if `User` schema already exists in `src/schemas/index.ts`.

## 3. When new Then logic is needed

If the scenario needs:

```gherkin
Then the user email domain should be "biz"
```

1. Add `assertUserEmailDomain(body, domain)` in `src/assertions/users.assertions.ts`
2. Add step in `steps/users.steps.ts` calling that assertion
3. Run `npm run bddgen`

## 4. Contract scenario (optional)

```gherkin
  @contract
  Scenario: User response matches OpenAPI
    When I send a GET request to "/users/1"
    Then the response status should be 200
    And the response should conform to the OpenAPI spec
```

Ensure `specs/openapi.yaml` defines `GET /users/{id}` and `200` response schema.

## 5. Run

```bash
npm run bddgen
npm test -- qa
```
