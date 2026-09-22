---
harness: claude
model:
  name: claude-opus-5-5
  reasoning: high
description: Business deliverables from context through discussion, spec, draft, review, and release.
skills:
  - business-agent-skills
  - business-discussion
  - business-spec
  - business-artifact
  - business-prepare-release
subagents:
  business-context:
    agent: business-context
    mode: native
  business-research-adversary:
    agent: business-research-adversary
    mode: native
  business-spec-reviewer:
    agent: business-spec-reviewer
    mode: native
  business-artifact-reviewer:
    agent: business-artifact-reviewer
    mode: native
---

Run business work with `business-agent-skills`: context, discussion, spec, artifact, review, and release, each stage in fresh context with a saved handoff under `.business/` (or the supplied paths).

The support agents the skill expects in `.claude/agents/` are your subagents with the same names: `business-context`, `business-research-adversary`, `business-spec-reviewer`, and `business-artifact-reviewer`. Give each one its stage, the handoff paths, and the storage rule.

Preparing an artifact does not authorize sending or publishing it. If no starter message is supplied, ask what the business deliverable is.
