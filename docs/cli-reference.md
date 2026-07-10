# CLI Command Reference

## `compose` (default — interactive)

Running `compose` with no arguments launches an interactive TUI:

1. Shows the currently active approach (read from `.compose-active`) or "none" if unset.
2. Lists all approaches found in `_approaches/`.
3. User selects an approach. Two options are presented:
   - **View** — display the approach composition (see `compose view` below)
   - **Apply** — apply the approach (see `compose apply` below)

## `compose apply <approach>`

Non-interactive apply. Can also be invoked from the interactive TUI.

Behaviour:

1. If a different approach was previously active (per `.compose-active`), delete each output
   file it declared, where that file still exists. If `.compose-active` does not exist or names
   the same approach, skip cleanup.
2. Read the approach YAML from `_approaches/<approach>.yaml`.
3. Scan every `.md` file in the docs root (except `_approaches/` and `_index.md`) for frontmatter
   `name:` fields to build the fragment lookup table.
4. For each output path, resolve its list of entries in order: `@id` entries look up a fragment
   by name; anything else is used as literal text. Join with a blank line.
5. Write each composed output file, creating parent directories as needed.
6. Write `<approach>` to `.compose-active`.

Errors if an `@id` reference cannot be resolved to any fragment.

## `compose view <approach>`

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

Output files are left-aligned. Each raw outputs-list entry is printed indented with 8 spaces
beneath its output file (literal text entries are printed as-is, not specially formatted).

## `compose init`

Interactive initialisation for a new project. Steps:

1. **Prompt for docs root name** — default `projectDocs`.
2. **Create the docs root directory** with a `_approaches/` subdirectory.
3. **Scaffold boilerplate**:
   - A sample fragment file at `<docs-root>/getting-started.md` with frontmatter showing `name:`
     and `description:` fields and placeholder content.
   - Curated starting prompts and starting skills shipped with the package (see
     [Starting Prompts & Skills](/starting-prompts)), copied into `<docs-root>/starting/`.
   - A sample approach YAML at `<docs-root>/_approaches/default.yaml`, wiring the root output
     file to the starting prompts + `getting-started`, and each starting skill to its own output
     path.
   - An empty `_index.md` placeholder (gitignored; not currently regenerated — see
     [Known Limitations](/known-limitations)).
4. **Scan for existing agent prompt files** anywhere in the project (excluding `node_modules`,
   `.git`, and the docs root itself) — recognized filenames: `AGENTS.md`, `CLAUDE.md`,
   `SKILL.md`, `GEMINI.md`, `.claude/agents/*.md`, and the exact path
   `.github/copilot-instructions.md`. For each found:
   - Register it as a whole-file fragment under `<docs-root>/existing/` with an auto-generated ID
     (derived from its path, kebab-cased).
   - Add it to the sample approach config as an output entry with its auto-generated `@id`. If
     it's the root file (see [Starting Prompts & Skills](/starting-prompts)), it's merged into
     the root output alongside the starting prompts; otherwise it gets its own output entry.
   - Does not modify the existing file.
5. **Add gitignore entries** — append to `.gitignore` (or create it):
   ```
   .compose-active
   projectDocs/_index.md   # (adjusted to actual docs root name)
   ```
6. All scaffolding steps are idempotent and non-destructive: re-running `compose init` never
   overwrites a file that already exists (including hand-edited starting prompts/skills), and
   reports what was newly created.

::: warning Known limitation
Only `compose init` respects a custom docs-root name. `compose apply`, `compose view`, and the
default interactive command all hardcode the docs root to `projectDocs`. See
[Known Limitations](/known-limitations).
:::
