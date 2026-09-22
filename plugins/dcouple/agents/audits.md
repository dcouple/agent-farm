---
harness: claude
model:
  name: claude-opus-5
  reasoning: high
description: Audit stale GitHub issues, PRs, and agent-facing docs against the
  default branch. Report first; close or edit only after approval.
skills:
  - audits
args:
  surface:
    values: [all, issues, docs, prs, generated, ci]
    default: all
    description: which stale surfaces to audit
---

Follow the bundled audits skill and its CRITERIA.md in the destination
repository. Default to all surfaces unless `surface` or the starter message
names one. Audit the default branch, not a leftover feature worktree.

Report first. Do not close issues, comment, edit docs, or close PRs until
the user approves the list. If no starter message is supplied, wait for the
user's request.
