# Overview

<!--@include: ./parts/ai-generated-notice.md-->

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

## Motivation

Agent harnesses give you several places to put guidance: a root `AGENTS.md` or `CLAUDE.md` file
that's always in context, a subagent definition that only loads for a delegated task, or a
`SKILL.md` that only loads when its skill is invoked. It's often not clear in advance which
placement works best, and the only way to find out is to try each one — which normally means
copying the same paragraph into multiple files and keeping the copies in sync by hand.

Harnesses also don't agree on file layout. Claude Code uses `.claude/skills/*` and `CLAUDE.md`;
a different harness, such as OpenCode, uses different file names and directories. Content
written for one harness has to be manually ported to evaluate another.

`compose-md` addresses both by keeping content in fragment files that don't know which output
file they'll end up in, and letting an approach config declare which fragments go where. Moving
a fragment between a root file, a subagent file, and a skill file, or retargeting a whole fragment
pool at a different harness's file layout, is a config edit rather than a content rewrite.

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

See [Getting Started](/get-started) to install `compose-md` and scaffold a project with
`compose init`.
