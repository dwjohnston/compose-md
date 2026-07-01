# Feature Brief: compose-md

## Summary

`compose-md` is a standalone, Node-compatible CLI library for composing markdown files from a fragment pool. Fragments are standalone `.md` files with frontmatter. Approach configs (YAML) declare how fragments are assembled into output files. A CLI manages approach selection, composition, and project initialisation.

---

## Core Concepts

**Fragment** — A standalone `.md` file with frontmatter. The `name` field is a stable ID used to reference the fragment in approach configs and include directives. The `description` field is used to generate the index.

```md
---
name: tooling
description: bun commands for test, typecheck, validate, and generate
---

# Tooling

...content...
```

**Include directive** — A comment in a template file that splices a fragment by its stable ID:

```
<!-- include: @tooling -->
```

ID-only. No path-based includes. No section extraction. Each reusable unit is its own fragment file.

**Approach** — A YAML config in `_approaches/` that declares which fragments compose into which output files.

```yaml
name: skills
description: Minimal root CLAUDE.md with skills carrying domain context
hypothesis: Lighter per-task context enables smaller model usage

outputs:
  CLAUDE.md:
    - @tooling
    - @language
    - @canonical-levels
    - @skills-index
  .claude/skills/compute-node/SKILL.md:
    - @compute-node-skill
    - @compute-node-patterns
```

**Active approach** — Tracked in a gitignored `.compose-active` file at the project root. Contains the name of the currently applied approach.

---

## Directory Structure

```
projectDocs/               ← docs root (name chosen at init)
  _approaches/             ← approach YAML configs
    skills.yaml
    default.yaml
  _index.md                ← generated; gitignored; regenerated on apply
  node-development/        ← fragment directories (user-defined)
    compute_node_patterns.md
    node_anatomy.md
  skill-fragments/
    compute_node_skill.md
.compose-active            ← gitignored; tracks active approach name
```

---

## CLI Commands

### `compose` (default — interactive)

Running `compose` with no arguments launches an interactive TUI:

1. Shows the currently active approach (read from `.compose-active`) or "none" if unset.
2. Lists all approaches found in `_approaches/`.
3. User selects an approach. Two options are presented:
   - **View** — display the approach composition (see View Format below)
   - **Apply** — apply the approach (see Apply below)

### `compose apply <approach>`

Non-interactive apply. Can also be invoked from the interactive TUI.

Behaviour:
1. Read the approach YAML from `_approaches/<approach>.yaml`.
2. Delete all output files written by the previously active approach (read from `.compose-active`). If `.compose-active` does not exist, skip cleanup.
3. Resolve each `<!-- include: @id -->` directive by looking up the fragment ID across all `.md` files in the docs root (scanning frontmatter `name:` fields).
4. Write composed output files to their declared paths.
5. Regenerate `_index.md` (see Index below).
6. Write `<approach>` to `.compose-active`.

Error if:
- An `@id` reference cannot be resolved to any fragment.
- A circular include is detected.
- An approach file references a non-existent output directory (warn, don't error — create parent dirs).

### `compose view <approach>`

Non-interactive view. Can also be invoked from the interactive TUI.

Prints the approach composition to stdout:

```
approach: skills

CLAUDE.md
        @tooling
        @language
        @skills-index

.claude/skills/compute-node/SKILL.md
        @compute-node-skill
        @compute-node-patterns
```

Output files are left-aligned. Fragment IDs are indented with 8 spaces beneath their output file.

### `compose init`

Interactive initialisation for a new project. Steps:

1. **Prompt for docs root name** — default `projectDocs`.
2. **Create the docs root directory** with `_approaches/` subdirectory.
3. **Scaffold boilerplate**:
   - A sample fragment file at `<docs-root>/getting-started.md` with frontmatter showing `name:` and `description:` fields and placeholder content.
   - A sample approach YAML at `<docs-root>/_approaches/default.yaml` referencing the sample fragment.
   - An empty `_index.md` placeholder (gitignored).
4. **Scan for existing agent prompt files** — look for `CLAUDE.md`, `SKILL.md`, and `.claude/agents/*.md` in the project. For each found:
   - Register it as a whole-file fragment with an auto-generated ID (derived from the filename, kebab-cased).
   - Add it to the sample approach config as an output entry with its auto-generated `@id`.
   - Do not modify the existing file.
5. **Add gitignore entries** — append to `.gitignore` (or create it):
   ```
   .compose-active
   projectDocs/_index.md   # (adjusted to actual docs root name)
   ```
6. Confirm what was created.

---

## Index Generation

`_index.md` is generated automatically on every `compose apply`. It is gitignored.

Format — one entry per fragment, sorted by directory then filename:

```md
# Index

## node-development

- **compute-node-patterns** — taxonomy of compute node categories and algorithm composition patterns
- **node-anatomy** — schema definition and runtime implementation for all node kinds

## skill-fragments

- **compute-node-skill** — tests and handoff format for compute node implementations
```

Only fragments with a `description` field in their frontmatter are included. Fragments without a description are silently skipped.

---

## Approach YAML Schema

```yaml
name: string           # required; matches filename without extension
description: string    # required; one-line summary
hypothesis: string     # optional; the experiment hypothesis being tested
status: string         # optional; e.g. "active", "retired", "experimental"

outputs:
  <output-path>:       # path relative to project root
    - @fragment-id     # one or more fragment IDs in order
```

---

## Fragment Frontmatter Schema

```yaml
name: string           # required; stable ID used in <!-- include: @name --> directives
description: string    # optional; used in _index.md generation
```

All other frontmatter fields are ignored by the library.

---

## Constraints

- Node-compatible (no Bun-specific APIs).
- No section extraction — each reusable unit is its own file.
- No path-based includes — all includes use `@id` syntax only.
- The `.compose-active` file and `_index.md` are always gitignored; `compose init` ensures this.
- Applying an approach performs a clean slate: all files from the previous approach are deleted before new files are written.
