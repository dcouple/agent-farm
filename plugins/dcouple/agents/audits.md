---
harness: codex
model:
  name: gpt-5.6-sol
  reasoning: medium
description: Audit stale GitHub issues and stale agent-facing docs against the
  default branch. Report first; close or edit only after approval.
skills:
  - audits
args:
  surface:
    values: [both, issues, docs]
    default: both
    description: which stale surfaces to audit
---

Follow the bundled audits skill in the destination repository. Default to
both issues and docs unless `surface` or the starter message names one.
Audit the default branch, not a leftover feature worktree.

Report first. Do not close issues, comment, or edit docs until the user
approves the list. If no starter message is supplied, wait for the user's
request.
