# compose-md

A CLI for composing markdown files from a fragment pool. Fragments are `.md` files with frontmatter. Approaches declare how fragments assemble into output files.

# Getting Started

Clone the repo and install dependencies:

```bash
git clone <repo>
bun install
```

Then run the CLI:

```bash
bun run src/cli.ts
```

# Tooling

Run tests:

```bash
bun test
bun test --update-snapshots
```

Run typecheck:

```bash
bun tsc --noEmit
```
