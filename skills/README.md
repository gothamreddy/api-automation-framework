# Agent skills

Tool-agnostic workflow docs for AI assistants (Cursor, Claude Code, Copilot, ChatGPT, etc.). Each subfolder is one skill with a `SKILL.md` entry point.

## Layout

```
skills/
├── README.md
└── <skill-name>/
    ├── SKILL.md       # Main instructions (read this first)
    ├── templates.md   # Optional
    └── examples.md    # Optional
```

## How to use

| Tool | How to apply |
|------|----------------|
| **Any chat** | Paste or attach `skills/<skill-name>/SKILL.md` and ask the agent to follow it |
| **Cursor** | `@skills/add-api-bdd-feature/SKILL.md` (optional: symlink `skills/` → `.cursor/skills` locally) |
| **Claude / custom agents** | Point `CLAUDE.md` or system prompt at `skills/<skill-name>/SKILL.md` |
| **CI / scripts** | Pass file path as context to your LLM pipeline |

## Available skills

| Skill | Path | Purpose |
|-------|------|---------|
| Add API BDD feature | [add-api-bdd-feature/SKILL.md](add-api-bdd-feature/SKILL.md) | Scaffold Gherkin features, steps, assertions, and helpers |
| Adapt framework | [adapt-framework/SKILL.md](adapt-framework/SKILL.md) | Reuse this harness on another API (config, env, drop samples) |

To add a new skill, create `skills/<kebab-case-name>/SKILL.md` with YAML frontmatter (`name`, `description`) and follow the same optional files pattern.
