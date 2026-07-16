# Getting Started

## Install

`compose-md` ships as a Node CLI Add it as a dev dependency of your project:

```sh
bun add -d compose-md
```

## Initialize a project

Run `init` from your project root:

```sh
bunx compose init
```

You'll be prompted for a **docs root name** (default `projectDocs`) — the folder that will hold
your fragments and approach configs.

### What `init` creates

```
.compose-config.json               # tells the tool where your docs root is
.gitignore                         # ignore .compose-active, _index.md
                                   # and all AGENTS.md, SKILL.md files etc
                                   # (see limitations)
projectDocs/
  _approaches/
    default.yaml                   # An initial approach containing all your existing prompts is created
  _index.md                        # gitignored; rebuilt on apply
                                   # This is a helpful index for you
                                   # to see your library of fragments
  starting/
    docs-workflow.md               # bundled starter prompt
    compose-docs-skill.md          # bundled skill fragment
  existing/                        # Your existing prompt files are converted to framents here
    agents.md                      # e.g. imported from AGENTS.md
    claude-agents-reviewer.md      # e.g. imported from .claude/agents/reviewer.md
```



## Next steps

Create a new approach by creating a new approach.yaml and apply it with 

```sh
bunx compose apply new-approach
```

Or run 

```sh
bunx compose 
```

to open the interative picker. 