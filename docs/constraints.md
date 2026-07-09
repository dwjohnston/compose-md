# Constraints

- Ships as a Bun CLI (`bun:test`, `bun run`, a `.ts` bin entry, `types: ["bun"]` in
  `tsconfig.json`). Node compatibility from the original design goal has not been carried
  through — see [Known Limitations](/known-limitations).
- Fragments are flat: a fragment's content cannot itself reference another fragment. Composition
  happens only at the approach-YAML level, and only one level deep (no recursive/circular
  resolution to guard against).
- There is no template file / include-directive layer — the approach YAML fully specifies each
  output's composition.
- The `.compose-active` file and `_index.md` are always gitignored; `compose init` ensures this.
- Applying a *different* approach performs a clean slate for the previous approach's declared
  outputs before writing the new ones; applying the same approach again just rewrites its
  outputs in place.
