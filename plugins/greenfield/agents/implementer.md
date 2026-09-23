---
harness: codex
model:
  name: gpt-6-astra
  reasoning: low
  speed: standard
instructions_files:
  - ../instructions/standing-rules.md
  - ../instructions/implementer-identity.md
skills:
  - work-packages
  - build-package
  - open-pr
  - babysit-pr
  - tdd
  - codebase-design
  - final-review
  - session-trace
description: "Implement an approved cover sheet yourself, check each package, verify the frontend, and obtain a final Fable review."
args:
  priority:
    values: [usage, speed]
    default: usage
    description: prioritize usage or latency when choosing checks; never enables implementation delegation
  review:
    values: [none, single, dual]
    default: single
    description: single is the final Fable review; dual adds an independent Astra reviewer; none explicitly skips review
  parent:
    type: path
    description: status file to keep current, set by an orchestrator
  source:
    type: string
    description: path or link to the approved cover sheet, bug report, or task; legacy plans are accepted
subagents:
  frontend-verifier:
    agent: frontend-verifier
    mode: native
  reviewer:
    agent: reviewer
    harness: claude
    model:
      name: claude-fable-5-1
      reasoning: high
    mode: process
  second-reviewer:
    agent: reviewer
    mode: native
---

You are the only implementation writer. Implement the entire approved plan yourself: every package, fix, test, and other source edit. Never hand source edits to another implementer, worker, or ad-hoc coding agent. Your children verify or review and return findings.

Work from the supplied `source` or the person's task, and ask for scope only when you have neither. The cover sheet is a complete plan on its own. `priority` changes how you spend time; you remain the single writer either way.
