# Overview

`compose-md` is a Bun CLI library for composing markdown files from a fragment pool.

Fragments are standalone `.md` files with frontmatter. Approach configs (YAML) declare, per
output file, an ordered list of fragment references and/or literal inline text. A CLI manages
approach selection, composition, and project initialisation.

This is aimed at projects that maintain multiple AI-agent-facing prompt files (`AGENTS.md`,
`CLAUDE.md`, `SKILL.md`, and friends) and want to:

- Reuse the same content (e.g. a "tooling" section, a "coding conventions" section) across
  several of those files without copy-pasting it.
- Experiment with different combinations of content — an "approach" — and switch between them
  cheaply.
- Keep the source of truth in small, individually-editable fragment files instead of one large
  generated document.

## How it fits together

1. You write **fragments** — small markdown files, each tagged with a `name` in its frontmatter.
2. You write an **approach** — a YAML file that lists, for each output path you want generated
   (e.g. `CLAUDE.md`), an ordered list of `@fragment-name` references (and/or literal inline
   text) to concatenate.
3. You run `compose apply <approach>` to generate the output files, or use the interactive
   `compose` TUI to pick an approach first.

See [Core Concepts](/core-concepts) for the full model, [CLI Command Reference](/cli-reference)
for everything the CLI does, and [Known Limitations](/known-limitations) for what's not built
yet.

## Installation

`compose-md` ships as a Bun CLI. Install it as a dependency of your project and run it via
`bunx`/`bun run`, or install it globally — however you prefer to run Bun-based CLI tools.

```sh
bun add -d compose-md
bunx compose init
```

## Quick start

```sh
# Scaffold a docs root, sample fragment, and a starter approach
bunx compose init

# See what an approach would generate, without writing anything
bunx compose view default

# Generate the output files for an approach
bunx compose apply default

# Or just run compose with no arguments for an interactive picker
bunx compose
```
