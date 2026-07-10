---
layout: home

hero:
  name: compose-md
  text: Compose markdown from a fragment pool
  tagline: A Bun CLI for building AGENTS.md / CLAUDE.md / SKILL.md-style files out of reusable, versioned markdown fragments.
  actions:
    - theme: brand
      text: Get Started
      link: /overview
    - theme: alt
      text: CLI Reference
      link: /cli-reference
    - theme: alt
      text: View on GitHub
      link: https://github.com/dwjohnston/compose-md

features:
  - title: Fragments
    details: Standalone .md files with frontmatter, each with a stable name used as an @id reference.
  - title: Approaches
    details: YAML configs that declare, per output file, an ordered list of fragment references and/or literal text.
  - title: One active approach at a time
    details: Switching approaches cleans up the previous approach's outputs before writing the new ones.
---
