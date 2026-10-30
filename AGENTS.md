# Agent instructions

Portable skills live under [`skills/`](skills/README.md)—not tied to a single IDE.

| Task | Skill |
|------|--------|
| New API BDD tests | [`skills/add-api-bdd-feature/SKILL.md`](skills/add-api-bdd-feature/SKILL.md) |
| Point this harness at another product | [`skills/adapt-framework/SKILL.md`](skills/adapt-framework/SKILL.md) |

Project adapter: [`framework.config.json`](framework.config.json) (environments + named services). Do not hardcode product URLs in `src/`.

Stack: Playwright Test + playwright-bdd + TypeScript; API-only via `APIRequestContext`.
