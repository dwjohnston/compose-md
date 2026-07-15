# Getting Started

<!--@include: ./parts/ai-generated-notice.md-->

## Install

`compose-md` ships as a Bun CLI. Add it as a dev dependency of your project:

```sh
bun add -d compose-md
```

## Initialize a project

Run `init` from your project root:

```sh
bunx compose init
```

You'll be prompted for a **docs root name** (default `projectDocs`) — the folder that will hold
your fragments and approach configs. If a folder with that name already exists, `init` asks for
confirmation before writing into it.

### What `init` creates

- **`<docsRoot>/_approaches/`** — the directory approach YAML configs live in.
- **`<docsRoot>/getting-started.md`** — a sample fragment (`@getting-started`) with a placeholder
  body, for you to fill in.
- **`<docsRoot>/starting/*.md`** — curated fragments shipped with `compose-md`: general starter
  prompts, plus any bundled skills (each shipped as a full `SKILL.md`).
- **`<docsRoot>/existing/*.md`** — `init` scans your project tree for files that already look like
  agent prompt files (`AGENTS.md`, `CLAUDE.md`, `SKILL.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.claude/agents/*.md`) and imports each one's content
  verbatim as its own fragment here, so nothing you've already written is lost or overwritten.
- **`<docsRoot>/_approaches/default.yaml`** — a generated approach that wires everything above
  together: the starting prompts and the `getting-started` fragment compose into your root output
  file (an existing root-level `AGENTS.md`/`CLAUDE.md` if one was found, otherwise a new
  `AGENTS.md`), every other imported file gets its own single-fragment output entry at its
  original path, and any bundled skill fragments are wired to `.agents/skills/<name>/SKILL.md`.
- **`<docsRoot>/_index.md`** — an empty placeholder file.
- **`.gitignore`** entries for `.compose-active`, the compose config file, and
  `<docsRoot>/_index.md`.

`init` also records the docs root name in your project's compose config, and prints a summary of
everything it created plus which existing files were registered as fragments
(`sourcePath → @fragmentId`).

## Next steps

Apply the approach `init` generated to regenerate your output files from the fragment pool:

```sh
bunx compose apply default
```

Or run `compose` with no arguments for an interactive picker. See
[Core Concepts](/core-concepts) for how fragments and approaches fit together, and the
[CLI Command Reference](/cli-reference) for everything else the CLI does.
