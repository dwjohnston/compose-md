# Known Limitations

- **`_index.md` generation is unimplemented.** `compose init` creates it as an empty
  placeholder; nothing currently regenerates it on `apply`. The original design's per-directory
  fragment index (grouped listing of fragments with descriptions) has been descoped, not built.
- **The CLI commands don't honor a custom docs-root name after init.** `compose apply`,
  `compose view`, and the default interactive command all hardcode the docs root to
  `projectDocs` (`src/cli.ts`), regardless of what name was chosen when `compose init` ran. Only
  `compose init` itself respects the prompted name.

## Divergences from the original design

The original brief described templates containing `<!-- include: @id -->` comment directives,
resolved by scanning for those comments, plus an automatically regenerated `_index.md`. Neither
was built. Instead, the approach YAML directly lists fragment references (and, now, literal
inline text) per output file — a flatter model with no separate template layer. Alongside that,
the implementation grew capabilities the original brief didn't anticipate: curated starting
prompts/skills shipped with the package and auto-wired on `init`, a root-file-only merge rule for
prompts that shouldn't be duplicated into every generated file, and a `$PROJECT_DOCS` placeholder
for docs-root-name substitution. The Bun-only runtime and the hardcoded `projectDocs` path in the
CLI commands are drift rather than deliberate design and are called out above as known
limitations rather than folded into the "intended" spec.
