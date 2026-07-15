# Schema Reference

<!--@include: ./parts/ai-generated-notice.md-->

## Approach YAML schema

```yaml
name: string           # required; matches filename without extension
description: string    # required; one-line summary

outputs:
  <output-path>:         # path relative to project root
    - "@fragment-id"      # a fragment reference (quoted; leading @)
    - literal text        # OR literal inline content, included verbatim
```

## Fragment frontmatter schema

```yaml
name: string           # required; stable ID used in "@name" references
description: string    # optional; informational only today
```

All other frontmatter fields are ignored by the library.
