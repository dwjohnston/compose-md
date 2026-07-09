# Starting Prompts & Skills

`compose init` ships two kinds of curated content, bundled with the package under
`src/startingPrompts/`:

- **Starting prompts** (`src/startingPrompts/*.md`) — copied into `<docs-root>/starting/<id>.md`
  as ordinary fragments, and wired *only into the root output file* (see below) — never into
  other discovered agent files. Today this ships `docs-workflow`, which tells an agent that
  AGENTS.md/CLAUDE.md/etc. are generated and gitignored, points it at the docs root, and tells it
  to redirect anything it would normally write into "memory" (i.e. directly into one of those
  files) into the corresponding fragment instead.
- **Starting skills** (`src/startingPrompts/skills/<skill-name>/SKILL.md`) — full skill files,
  copied in and wired to their *own* dedicated output path,
  `.agents/skills/<skill-name>/SKILL.md`, rather than merged into the root file. Today this ships
  `compose-docs`, a skill that explains the fragment/approach model and the edit →
  `compose apply` workflow.

Both support a `$PROJECT_DOCS` placeholder in their source content, substituted with the actual
chosen docs-root name at `init` time.

## The "root file"

The root file is whichever pre-existing agent file lives at the project root with no directory
component (preferring `AGENTS.md` if present, otherwise the first one found alphabetically). If
none exists, `AGENTS.md` is created as the root file. Starting prompts and the sample
`getting-started` fragment are wired only into this one file; every other discovered agent file
(nested, or additional root-level files) gets only its own content fragment.

## Fragment vs. skill wiring detail

Because fragment scanning strips a file's outermost frontmatter block (to recover the fragment's
own `name`/`description` for `@id` lookup), a starting skill's *real* `SKILL.md` frontmatter
(e.g. `name: compose-docs`) is nested one level in: the compose-md fragment wrapper has its own
bookkeeping frontmatter (`name: compose-docs-skill`), and the real `SKILL.md` frontmatter is the
first thing in the fragment's body, so it survives into the composed output verbatim.
