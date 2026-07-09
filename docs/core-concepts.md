# Core Concepts

## Fragment

A standalone `.md` file with frontmatter, anywhere under the docs root (except `_approaches/`
and `_index.md`). The `name` field is a stable ID used to reference the fragment from approach
configs. The `description` field is optional and informational only.

```md
---
name: tooling
description: bun commands for test, typecheck, validate, and generate
---

# Tooling

...content...
```

## Approach

A YAML config in `_approaches/` that declares, per output file, an ordered list of fragment
references (`"@id"`) and/or literal inline text.

Composing an output joins its list entries in order, each trimmed, separated by a blank line.

```yaml
name: skills
description: Minimal root CLAUDE.md with skills carrying domain context
hypothesis: Lighter per-task context enables smaller model usage

outputs:
  CLAUDE.md:
    - "@tooling"
    - "@language"
    - "@canonical-levels"
    - "@skills-index"
  .claude/skills/compute-node/SKILL.md:
    - "@compute-node-skill"
    - "@compute-node-patterns"
```

::: warning
`@id` references must be quoted. YAML reserves a bare leading `@`, so an unquoted `@tooling`
will fail to parse.
:::

## Literal inline content

A list entry that does not start with `@` is included verbatim as literal text, rather than
resolved as a fragment reference. This covers bespoke, one-off content (e.g. a frontmatter
header) that isn't worth its own fragment file. YAML block scalars (`|`) give multiline literal
text for free:

```yaml
outputs:
  AGENTS.md:
    - |
      ---
      title: Bespoke Header
      ---
    - "@docs-workflow"
```

## Active approach

Tracked in a gitignored `.compose-active` file at the project root. Contains the name of the
currently applied approach. When switching approaches, `compose apply` deletes the output files
declared by the *previous* active approach before writing the new ones.
