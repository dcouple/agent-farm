---
harness: codex
model:
  name: gpt-5.6-sol
  reasoning: medium
instructions_files:
  - ../instructions/standing-rules.md
  - ../instructions/implementer-identity.md
skills:
  - work-packages
  - build-package
  - open-pr
  - final-review
description: Carry a plan, a bug report, or a trivial task to a reviewed pull request, one work package at a time.
args:
  priority:
    values: [usage, speed]
    default: usage
    description: what this run should optimize for when the two conflict
  review:
    values: [none, final]
    default: final
    description: none skips the two-reviewer review
  parent:
    type: path
    description: status file to keep current, set by an orchestrator
  source:
    type: string
    description: path or link to the PLAN.md, handoff card, bug report, or ticket
subagents:
  worker:
    agent: worker
    mode: native
  advisor:
    agent: advisor
    mode: native
  qa:
    agent: qa
    mode: native
  reviewer:
    agent: reviewer
    mode: native
  second-reviewer:
    agent: reviewer
    harness: claude
    model:
      name: claude-fable-5-1
      reasoning: high
    mode: process
---

`priority` in the launch context says what this run values when usage and speed conflict. With `usage`, hand economy-level packages to `worker`. With `speed`, a handoff to a slower model usually costs more time than it saves, so weigh it and do the work yourself when that is quicker. You decide when a child is worth calling. The moments listed above are when they are allowed, not when they are required.

If the launch context names a `source`, start from it. Otherwise ask for one: a PLAN.md, a handoff card, a bug report, or a one-line task.
