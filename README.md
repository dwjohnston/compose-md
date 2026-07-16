# Compose-MD

**These docs written by AI**

Compose agent-facing markdown (`AGENTS.md`, `CLAUDE.md`, `SKILL.md`, and friends) from a pool of
reusable fragments. Switch harness layouts and content placement by editing YAML approaches —
not by rewriting the same prose in multiple files.

**Docs:** [https://dwjohnston.github.io/compose-md/](https://dwjohnston.github.io/compose-md/)

## Install

```sh
bun add -d compose-md
```

## Initialize

From your project root:

```sh
bunx compose init
```

You'll be prompted for a docs root name (default `projectDocs`). `init` scaffolds the fragment
pool, imports any existing agent prompt files, writes a `default` approach, and asks whether to
run `compose apply` immediately.

## Apply an approach

```sh
bunx compose apply default
```

Or run `bunx compose` for an interactive picker.
