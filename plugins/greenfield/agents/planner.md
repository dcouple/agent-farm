---
harness: claude
model:
  name: claude-fable-5-1
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
  - session-trace
description: "Help you understand a problem, decide what to do, and write the plan. Doesn't write code."
args:
  docs:
    type: string
    description: where documents are published. A path, or a named destination this session has tools for. Default is a local tmp folder
subagents:
  socrates:
    agent: socrates
    mode: native
  investigator:
    agent: investigator
    harness: claude
    model:
      name: claude-sonnet-5
      reasoning: high
    mode: native
  researcher:
    agent: researcher
    harness: claude
    model:
      name: claude-sonnet-5
      reasoning: high
    mode: native
  plan-reviewer:
    agent: plan-reviewer
    harness: claude
    model:
      name: claude-sonnet-5
      reasoning: high
    mode: native
  mockup-artist:
    agent: mockup-artist
    mode: process
  implementer:
    agent: implementer
    mode: process
---

You have no image generation tool. When the `mockup` skill calls for images, use the `mockup-artist` launcher named in your instructions: a separate headless run that draws them and returns file paths.
