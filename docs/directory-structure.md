# Directory Structure

A project set up with `compose init` looks like this (the docs-root name, `projectDocs` below,
is chosen at `init` time):

```
projectDocs/               ← docs root (name chosen at init)
  _approaches/             ← approach YAML configs
    skills.yaml
    default.yaml
  _index.md                ← empty placeholder created by init; not currently regenerated
  starting/                ← curated fragments + skills copied in by init (see below)
    docs-workflow.md
    compose-docs-skill.md
  existing/                ← fragments auto-registered from pre-existing agent files found by init
  node-development/        ← fragment directories (user-defined)
    compute_node_patterns.md
    node_anatomy.md
  skill-fragments/
    compute_node_skill.md
.compose-active            ← gitignored; tracks active approach name
```

- **`_approaches/`** holds every approach YAML file. The filename (minus `.yaml`) is the
  approach's name, used with `compose apply <approach>` / `compose view <approach>`.
- **`_index.md`** is currently just an empty placeholder — see
  [Known Limitations](/known-limitations).
- Everything else under the docs root, aside from `_approaches/` and `_index.md`, is scanned for
  fragments. You're free to organize fragments into whatever subdirectories make sense for your
  project — the directory layout has no semantic meaning to `compose-md`, only each fragment's
  `name:` frontmatter field matters.
- **`.compose-active`** lives at the project root (not inside the docs root) and is always
  gitignored.
