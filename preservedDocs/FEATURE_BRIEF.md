# Feature Brief: compose-md

## Summary

`compose-md` is a Bun CLI library for composing markdown files from a fragment pool. Fragments are standalone `.md` files with frontmatter. Approach configs (YAML) declare, per output file, an ordered list of fragment references and/or literal inline text. A CLI manages approach selection, composition, and project initialisation.

Progress on this feature is tracked on the [dwjohnston/1 GitHub Project](https://github.com/users/dwjohnston/projects/1/views/1).

This brief has been revised to match the implementation as built — see "Divergences from the original design" at the bottom for what changed and why.

---

## Core Concepts

**Fragment** — A standalone `.md` file with frontmatter, anywhere under the docs root (except `_approaches/` and `_index.md`). The `name` field is a stable ID used to reference the fragment from approach configs. The `description` field is optional, informational only.

```md
---
name: tooling
description: bun commands for test, typecheck, validate, and generate
---

# Tooling

...content...
```

**Approach** — A YAML config in `_approaches/` that declares, per output file, an ordered list of fragment references (`"@id"`) and/or literal inline text.

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

`@id` references must be quoted — YAML reserves a bare leading `@` and will fail to parse otherwise.

**Literal inline content** — A list entry that does not start with `@` is included verbatim as literal text, rather than resolved as a fragment reference. This covers bespoke, one-off content (e.g. a frontmatter header) that isn't worth its own fragment file. YAML block scalars (`|`) give multiline literal text for free:

```yaml
outputs:
  AGENTS.md:
    - |
      ---
      title: Bespoke Header
      ---
    - "@docs-workflow"
```

**Active approach** — Tracked in a gitignored `.compose-active` file at the project root. Contains the name of the currently applied approach. When switching approaches, `compose apply` deletes the output files declared by the *previous* active approach before writing the new ones.

---

## Directory Structure

```
projectDocs/               ← docs root (name chosen at init)
  _approaches/             ← approach YAML configs
    skills.yaml
    default.yaml
  _index.md                ← empty placeholder created by init; not currently regenerated (see below)
  starting/                ← curated fragments + skills copied in by init (see below)
    docs-workflow.md
    compose-docs-skill.md
  existing/                ← fragments auto-registered from pre-existing agent files found by init
  node-development/        ← fragment directories (user-defined)
    compute_node_patterns.md
    node_anatomy.md
  skill-fragments/
    compute_node_skill.md
.compose-active            ← gitignored; tracks active approach name
```

---

## Starting Prompts & Skills

`compose init` ships two kinds of curated content, bundled with the package under `src/startingPrompts/`:

- **Starting prompts** (`src/startingPrompts/*.md`) — copied into `<docs-root>/starting/<id>.md` as ordinary fragments, and wired *only into the root output file* (see below) — never into other discovered agent files. Today this ships `docs-workflow`, which tells an agent that AGENTS.md/CLAUDE.md/etc. are generated and gitignored, points it at the docs root, and tells it to redirect anything it would normally write into "memory" (i.e. directly into one of those files) into the corresponding fragment instead.
- **Starting skills** (`src/startingPrompts/skills/<skill-name>/SKILL.md`) — full skill files, copied in and wired to their *own* dedicated output path, `.agents/skills/<skill-name>/SKILL.md`, rather than merged into the root file. Today this ships `compose-docs`, a skill that explains the fragment/approach model and the edit → `compose apply` workflow.

Both support a `$PROJECT_DOCS` placeholder in their source content, substituted with the actual chosen docs-root name at `init` time.

**The "root file"** is whichever pre-existing agent file lives at the project root with no directory component (preferring `AGENTS.md` if present, otherwise the first one found alphabetically). If none exists, `AGENTS.md` is created as the root file. Starting prompts and the sample `getting-started` fragment are wired only into this one file; every other discovered agent file (nested, or additional root-level files) gets only its own content fragment.

**Fragment vs. skill wiring detail** — because fragment scanning strips a file's outermost frontmatter block (to recover the fragment's own `name`/`description` for `@id` lookup), a starting skill's *real* SKILL.md frontmatter (e.g. `name: compose-docs`) is nested one level in: the compose-md fragment wrapper has its own bookkeeping frontmatter (`name: compose-docs-skill`), and the real SKILL.md frontmatter is the first thing in the fragment's body, so it survives into the composed output verbatim.

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
1. If a different approach was previously active (per `.compose-active`), delete each output file it declared, where that file still exists. If `.compose-active` does not exist or names the same approach, skip cleanup.
2. Read the approach YAML from `_approaches/<approach>.yaml`.
3. Scan every `.md` file in the docs root (except `_approaches/` and `_index.md`) for frontmatter `name:` fields to build the fragment lookup table.
4. For each output path, resolve its list of entries in order: `@id` entries look up a fragment by name; anything else is used as literal text. Join with a blank line.
5. Write each composed output file, creating parent directories as needed.
6. Write `<approach>` to `.compose-active`.

Error if an `@id` reference cannot be resolved to any fragment.

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

Output files are left-aligned. Each raw outputs-list entry is printed indented with 8 spaces beneath its output file (literal text entries are printed as-is, not specially formatted).

### `compose init`

Interactive initialisation for a new project. Steps:

1. **Prompt for docs root name** — default `projectDocs`.
2. **Create the docs root directory** with `_approaches/` subdirectory.
3. **Scaffold boilerplate**:
   - A sample fragment file at `<docs-root>/getting-started.md` with frontmatter showing `name:` and `description:` fields and placeholder content.
   - Curated starting prompts and starting skills shipped with the package (see "Starting Prompts & Skills" above), copied into `<docs-root>/starting/`.
   - A sample approach YAML at `<docs-root>/_approaches/default.yaml`, wiring the root output file to the starting prompts + `getting-started`, and each starting skill to its own output path.
   - An empty `_index.md` placeholder (gitignored; not currently regenerated — see Known Limitations).
4. **Scan for existing agent prompt files** anywhere in the project (excluding `node_modules`, `.git`, and the docs root itself) — recognized filenames: `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `GEMINI.md`, `.claude/agents/*.md`, and the exact path `.github/copilot-instructions.md`. For each found:
   - Register it as a whole-file fragment under `<docs-root>/existing/` with an auto-generated ID (derived from its path, kebab-cased).
   - Add it to the sample approach config as an output entry with its auto-generated `@id`. If it's the root file (see above), it's merged into the root output alongside the starting prompts; otherwise it gets its own output entry.
   - Do not modify the existing file.
5. **Add gitignore entries** — append to `.gitignore` (or create it):
   ```
   .compose-active
   projectDocs/_index.md   # (adjusted to actual docs root name)
   ```
6. All scaffolding steps are idempotent and non-destructive: re-running `compose init` never overwrites a file that already exists (including hand-edited starting prompts/skills), and reports what was newly created.

---

## Approach YAML Schema

```yaml
name: string           # required; matches filename without extension
description: string    # required; one-line summary
hypothesis: string     # optional; the experiment hypothesis being tested
status: string         # optional; e.g. "active", "retired", "experimental"

outputs:
  <output-path>:        # path relative to project root
    - "@fragment-id"     # a fragment reference (quoted; leading @)
    - literal text        # OR literal inline content, included verbatim
```

---

## Fragment Frontmatter Schema

```yaml
name: string           # required; stable ID used in "@name" references
description: string    # optional; informational only today
```

All other frontmatter fields are ignored by the library.

---

## Constraints

- Ships as a Bun CLI (`bun:test`, `bun run`, a `.ts` bin entry, `types: ["bun"]` in `tsconfig.json`). Node compatibility from the original design goal has not been carried through — see Known Limitations.
- Fragments are flat: a fragment's content cannot itself reference another fragment. Composition happens only at the approach-YAML level, and only one level deep (no recursive/circular resolution to guard against).
- There is no template file / include-directive layer — the approach YAML fully specifies each output's composition.
- The `.compose-active` file and `_index.md` are always gitignored; `compose init` ensures this.
- Applying a *different* approach performs a clean slate for the previous approach's declared outputs before writing the new ones; applying the same approach again just rewrites its outputs in place.

---

## Known Limitations

- **`_index.md` generation is unimplemented.** `compose init` creates it as an empty placeholder; nothing currently regenerates it on `apply`. The original design's per-directory fragment index (grouped listing of fragments with descriptions) has been descoped, not built.
- **The CLI commands don't honor a custom docs-root name after init.** `compose apply`, `compose view`, and the default interactive command all hardcode the docs root to `projectDocs` (`src/cli.ts`), regardless of what name was chosen when `compose init` ran. Only `compose init` itself respects the prompted name.

---

## Divergences from the original design

The original brief described templates containing `<!-- include: @id -->` comment directives, resolved by scanning for those comments, plus an automatically regenerated `_index.md`. Neither was built. Instead, the approach YAML directly lists fragment references (and, now, literal inline text) per output file — a flatter model with no separate template layer. Alongside that, the implementation grew capabilities the original brief didn't anticipate: curated starting prompts/skills shipped with the package and auto-wired on `init`, a root-file-only merge rule for prompts that shouldn't be duplicated into every generated file, and a `$PROJECT_DOCS` placeholder for docs-root-name substitution. The Bun-only runtime and the hardcoded `projectDocs` path in the CLI commands are drift rather than deliberate design and are called out above as known limitations rather than folded into the "intended" spec.
