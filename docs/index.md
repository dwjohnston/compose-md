# Compose-MD

<!--@include: ./parts/ai-generated-notice.md-->

`compose-md` is a Bun CLI that composes markdown files — `AGENTS.md`, `CLAUDE.md`, `SKILL.md`,
and similar agent-facing prompt files — from a pool of reusable fragments.

Two problems led to it:

- It's often unclear upfront whether a piece of guidance belongs in a root instruction file, a
  subagent definition, or a skill file. Testing each placement by hand means copying the same
  content into multiple files and keeping the copies in sync.
- Different agent harnesses expect different files and directory layouts. Claude Code uses
  `.claude/skills/*` and `CLAUDE.md`; an alternative harness like OpenCode uses something else.
  Retargeting hand-written docs to a new harness means porting them by hand.

`compose-md` keeps the content in small fragment files with a stable name, and uses an approach
config to declare which fragments go into which output files. Changing where content lands, or
which harness you're targeting, is a config edit, not a rewrite.

See [Overview](/overview) for how the pieces fit together, or jump straight to
[Getting Started](/get-started).

