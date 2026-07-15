---
exampleValue: "hello from core-concepts.md's frontmatter"
additionalAiNotice: "🙋‍♂️ Human notice: I'm quite active here."
---

# Core Concepts

<!--@include: ./parts/ai-generated-notice.md-->


## Docs root

The docs root is a folder containing all your documents.

```
projectDocs/
   _approaches/
     my-approach.yaml
   somefolder/
      file1.md
   _index.md
```

## Fragment

A fragment is a standalone `.md` file with frontmatter,  that lives in your docs root, used to compose the actual output files you want to create.

The `name` field is a stable ID used to reference the fragment from approach configs. The
`description` field is optional and is used when creating the `_index.md`.

```md
---
name: tooling
description: bun commands for test, typecheck, validate, and generate
---

# Tooling

...content...
```

## Approach

An approach is a YAML config in `_approaches/` that declares, per output file, an ordered list
of fragment references (`"@id"`) and/or literal inline text.

Composing an output joins its list entries in order, each trimmed, separated by a blank line.

```yaml
name: skills
description: Minimal root CLAUDE.md with skills carrying domain context
hypothesis: Lighter per-task context enables smaller model usage

outputs:
  CLAUDE.md:
    - "If the string does not start with the '@' symbol, this text will be inserted literally"
    - "@tooling"
    - | 
      You can use the yaml pipe operator
      to construct multiline strings  
    - "@language"
    - "@canonical-levels"
    - "@skills-index"
  .claude/skills/compute-node/SKILL.md:
    - "@compute-node-skill"
    - "@compute-node-patterns"
```

::: warning
`@id` references must be quoted. YAML reserves a bare leading `@`, so an unquoted `@tooling`
will fail to parse.
:::

## _index.md

A .gitignored _index.md file will be created in your docs root. 

This is for the human user's own convenience to make sense of 


## Active approach

Tracked in a gitignored `.compose-active` file at the project root. Contains the name of the
currently applied approach. When switching approaches, `compose apply` deletes the output files
declared by the *previous* active approach before writing the new ones.
