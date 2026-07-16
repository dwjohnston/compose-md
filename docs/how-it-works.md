# How It Works


## Prompt files are gitignored

AGENTS.md, SKILL.md, CLAUDE.md files etc are .gitignored

When you run `compose apply <approach-name>` the existing prompt files are removed and new ones are created.

## Prompts are included to let your agent know not to modify the prompts directly

`compose init` adds these two fragments to your fragment library and wires them into the
`default` approach:

- **`@docs-workflow`** — `starting/docs-workflow.md`, included in the root output file
- **`@compose-docs-skill`** — `starting/compose-docs-skill.md`, wired to
  `.agents/skills/compose-docs/SKILL.md`

### `@docs-workflow`

<<< ../src/startingPrompts/docs-workflow.md{md}

### `@compose-docs-skill`

<<< ../src/startingPrompts/skills/compose-docs/SKILL.md{md}


This _should_ keep the agent from directly modifying prompt files, and instead be updating the fragment pool.