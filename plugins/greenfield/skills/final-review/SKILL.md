---
name: final-review
description: Use when the build is finished and a draft pull request is open. Independent review followed by targeted fixes, revalidation, and clean-up; one reviewer by default, two when requested.
---

# Final review

Review runs single lane with your primary `reviewer` by default. Record the mode at the top of the cover sheet with the plan metadata, and keep the PR and status metadata consistent with it.

- **Small, low-risk changes** such as copy, docs, or straightforward config edits may skip review automatically. Say so and give the reason up front, and record `Review: skipped — small, low-risk change` in the plan metadata and PR. Judge by impact: a short patch that changes behavior, security, migrations, or production still gets reviewed.
- **Dual review or no review** (`dual` or `none`) needs the person's explicit approval. Tell them the proposed mode, the reviewers, and the reason, and wait for their answer before starting. An explicit user request or a user-supplied launch flag counts as approval; acknowledge it up front and go ahead. Approval has to come from the user: an agent-written plan, an inherited flag, a legacy risk rule, or configuration doesn't count. Record the reason and approval reference with the mode.

## Review, then follow up on fixes

1. Confirm the review mode and any required user approval before dispatch. Single lane uses `reviewer`. User-approved dual review adds `second-reviewer` on the same commit. User-approved `none`, or the small-change exception above, skips review. Announce any mode other than single lane before dispatch, and record the mode, reason, and approval or small-change exception in the cover-sheet header and pull request.
2. Send the material: the diff and current commit, the approved cover sheet with its journey numbers or check names (or the legacy plan, bug report, or task), and current verification evidence. For `reviewer`, call the launcher named in your instructions with `--message`, and give it file paths and the commit instead of pasted content. Let each reviewer choose its own method, and show each one only its own findings.
3. Take the must-fix list from the report. With two reports it is the union of both, with duplicates combined. You do not get to overrule a must-fix. If a finding contradicts a locked decision or the plan itself, leave it unfixed, mark it disputed, and put it in front of the person.
4. You, the implementer, fix every confirmed must-fix finding yourself; reviewers only report. Notes need no action. Re-run only the affected checks and journeys.
5. Follow up. Send each reviewer that reported must-fix items its own items, the fix diff and current commit. It confirms each item is resolved and says whether the fix introduced anything new. Follow-ups stay limited to those items and the fix diff, not another whole-feature review.
6. If an original must-fix remains or a fix introduces another, correct it and repeat affected checks, qa journeys and reviewer follow-up. Record each attempt and its evidence. Nonblocking notes and locked decisions stay as they are. If the same finding persists without progress, diagnose it and try a different evidence-backed approach within scope. Ask the reviewer to clarify a finding when needed, and keep the fixes yourself.

## Stop for a concrete reason, not a retry count

Apply the standing rules' stop conditions and explicit user limits. In particular:

- An unresolved must-fix means keep correcting, however many rounds it takes. Stop `failed` only when diagnosis and review evidence leave no viable in-scope repair.
- A missing decision, permission, or prerequisite that cannot be safely resolved in scope means `blocked`. When qa cannot log in, a service is unreachable, a tool is missing, or output is ambiguous, record affected checks as `undetermined` and diagnose the cause. Never turn an undetermined check into a pass or make speculative product edits to hide an environment problem.
- If a reviewer cannot be launched, record a missing capability. In a single review, fall back once: if `reviewer` cannot be launched, announce the substitute before dispatch, set the top review metadata to single lane with the substitute's model and a note that the primary reviewer was unavailable, and run `second-reviewer` as the one reviewer. Record the fallback in the pull request. If neither launches, or a dual review is short a reviewer, stop.

On a required stop: leave the pull request as a draft, and put the state and reason at the top of its description and in the status file: what is still open with evidence, what was tried, which checks are undetermined and why, and the exact decision, capability, or changed constraint needed to resume. Preserve the work rather than starting over. Set `question` for a blocker or explicit limit requiring the person's direction, and `failure` for an exhausted repair. More attempts do not authorize more scope, weaker checks, new paid services, or external actions.

## Clean up

Only once the review is accepted, or was skipped: [references/clean-up.md](references/clean-up.md). Then update the pull request's Review and Clean-up sections.
