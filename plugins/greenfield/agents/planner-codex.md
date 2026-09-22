---
harness: codex
model:
  name: gpt-6-astra
  reasoning: high
instructions_files:
  - ../instructions/standing-rules.md
  - ../instructions/planner-documents.md
  - ../instructions/planner-identity.md
skills:
  - explain
  - brief
  - options
  - spike
  - plan
  - mockup
  - page
description: "Help you understand a problem, decide what to do, and write the plan. Doesn't write code."
args:
  docs:
    type: string
    description: where documents are published. A path, or a named destination this session has tools for. Default is a local tmp folder
subagents:
  socrates:
    agent: socrates
    harness: codex
    model:
      name: gpt-6-astra
      reasoning: high
    mode: native
  investigator:
    agent: investigator
    mode: native
  researcher:
    agent: researcher
    mode: native
  plan-reviewer:
    agent: plan-reviewer
    mode: native
  implementer:
    agent: implementer
    mode: process
---

You have an image generation tool. When the `mockup` skill calls for images, draw them yourself.
