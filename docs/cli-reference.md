# CLI Command Reference

## `compose`

Launches an interactive TUI:

Lists the available approaches: 

One one is selected, you can choose between 'view' and apply'

## `compose apply <approach>`

Apply an approach

1. Cleans up all generated files
2. Regenerate files for the given appraoch. 

## `compose view <approach>`

Prints the approach composition to stdout:

```
approach: skills

CLAUDE.md
        @tooling
        @language
        @skills-index

.claude/skills/compute-node/SKILL.md
        @compute-node-skill
        @compute-node-patterns
```

## `compose init`

Interactive initialisation for a new project. 

- Creates docs root (default `projectDocs`)
- .gitignore all prompt files 
- Scan for existing prompts and create as whole-file fragment under `<docs-root>/existing/` 
- Create `default` approach which replicates the current state 

See limitations