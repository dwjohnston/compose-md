---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Compose-MD"
  text: "One fragment pool. Many harness layouts."
  actions:
    - theme: brand
      text: Get Started
      link: /get-started
    - theme: alt
      text: Overview
      link: /overview
---

```md
Prefer tests that fail for the right reason.
Prefer visual snapshots for UI regressions.
Keep architecture decisions near the code they constrain.
```

Should this be a `CLAUDE.md`? An `AGENTS.md`? A `SKILL.md`? 🤔

Claude doesn't support `.agents/skills/*/SKILL.md`.

And Codex doesn't support `.claude/skills/*/SKILL.md`.

But what if you want to use multiple harnesses?

## The solution: compose-md

Create your instructions in a docs root folder:

```
projectDocs/
  testing/
    tdd.md
    visual-tests.md
  architecture/
    core-concepts.md
```

Declare your approaches — same fragments, different layouts:

::: code-group

```yaml [agents]
name: agents
description: Everything in a root AGENTS.md
outputs:
  AGENTS.md:
    - "@tdd"
    - "@visual-tests"
    - "@core-concepts"
```

```yaml [skills]
name: skills
description: Domain guidance as skills, light root file
outputs:
  CLAUDE.md:
    - "Load a skill when the task matches its domain."
  .claude/skills/testing/SKILL.md:
    - "@tdd"
    - "@visual-tests"
  .claude/skills/architecture/SKILL.md:
    - "@core-concepts"
```

:::

Then apply the approach:

```sh
compose apply skills
```

Switch harnesses — or experiment with placement — by editing YAML, not rewriting content.
