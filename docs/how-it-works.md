# How It Works

<!--@include: ./parts/ai-generated-notice.md-->

Two things trip people up about the generated files: what's committed to git and what isn't, and
what happens on disk when you switch which approach is applied. Both are covered here.

## What gets gitignored

`compose init` adds three entries to `.gitignore`:

```
.compose-active
.compose-config.json
<docsRoot>/_index.md
```

- **`.compose-active`** — records which approach is currently applied. This is local, per-checkout
  state (whichever approach you last ran `apply` with), not something to share via git.
- **`.compose-config.json`** — records the docs root name chosen at `init` time.
- **`<docsRoot>/_index.md`** — rebuilt on every `apply` from the fragment pool's descriptions (see
  [Core Concepts](/core-concepts)). Since it's fully derived, there's nothing to diff.

Everything else is meant to be committed: the fragment files, the approach YAML configs, and —
importantly — the *output files themselves* (`CLAUDE.md`, `AGENTS.md`, `SKILL.md`, or whatever an
approach's `outputs` map declares). Those are real files your agent harness reads directly;
`compose-md` treats them as artifacts that belong in the repo, not as disposable build output.

## Switching between approaches

Only one approach is "active" at a time, tracked in `.compose-active`. Applying a *different*
approach than the currently active one triggers a cleanup step first: every output path the
previous approach declared is deleted, if it still exists, before any of the new approach's
outputs are written.

This matters because two approaches can target different, overlapping, or non-overlapping sets of
output files. If approach `skills` writes `.claude/skills/compute-node/SKILL.md` and you switch to
an approach that doesn't mention that path at all, the file is removed rather than left behind as
a stale leftover from the old arrangement.

Re-applying the *same* approach you're already on skips this cleanup step entirely — it just
rewrites the outputs in place. So comparing two approaches is just:

```sh
bunx compose apply approach-a   # inspect the generated files
bunx compose apply approach-b   # approach-a's outputs are removed, approach-b's are written
```

If the approach you're switching *away from* has since had its YAML file deleted, cleanup is
silently skipped — there's nothing left to look up.
