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

## _index.md

A .gitignored _index.md file is created when you run `apply`. 

This is mostly for the user to make sense of what is in their fragment library. 

```md
# Fragment Index

- **agents** (existing/agents.md): content of AGENTS.md
- **claude-agents-reviewer** (existing/claude-agents-reviewer.md): content of .claude/agents/reviewer.md
- **tooling** (somefolder/tooling.md): bun commands for test, typecheck, validate, and generate
- **compose-docs-skill** (starting/compose-docs-skill.md): Compose Docs Skill
- **docs-workflow** (starting/docs-workflow.md): Docs Workflow
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



## Active approach

Tracked in a gitignored `.compose-active` file at the project root. Contains the name of the
currently applied approach. When switching approaches, `compose apply` deletes the output files
declared by the *previous* active approach before writing the new ones.
