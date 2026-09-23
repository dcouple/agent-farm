---
name: final-review
description: Use when the build is finished and a draft pull request is open. Independent review followed by targeted fixes, revalidation, and clean-up; one reviewer by default, two when requested.
---

# Final review

Default to single-lane Fable review. Small, low-risk changes (such as copy, docs, or straightforward config edits) may automatically skip independent review: disclose the skip and reason up front and record `Review: skipped — small, low-risk change` in the plan metadata and PR. Judge impact, not just diff size; behavior, security, migrations, and production-affecting changes do not qualify merely because the patch is short. For any other non-single mode (`dual` or `none`), tell the person the proposed mode, reviewers, and reason, and ask for explicit approval. Do not begin dual review or skip review while approval is pending. An explicit user request or user-supplied launch flag already authorizes that mode; acknowledge it up front without asking again. An agent-generated plan, inherited flag, legacy risk rule, or configuration alone is not evidence of user approval. Record the mode at the top of the cover sheet with the plan metadata, including the reason and approval reference for exceptions. Keep PR/status metadata consistent.

## Review, then follow up on fixes

1. Confirm the review mode and any required user approval before dispatch. Single lane uses `reviewer`, the Fable process child. User-approved dual review adds `second-reviewer`, a native child, on the same commit. User-approved `none`, or the documented small-change exception above, skips review. Disclose any non-single mode up front, not only in the final report; record the mode, reason, and approval or small-change exception in the cover-sheet header and pull request.
2. Send the material: the diff and current commit, the approved cover sheet with its journey numbers or check names (or legacy plan/bug report/task), and current verification evidence. No detailed markdown plan is required. For `reviewer`, call the launcher named in your instructions with `--message`, and give it file paths and the commit, not pasted content. Do not tell a reviewer how to review, and do not show one the other's findings.
3. Take the must-fix list from the report. With two reports it is the union of both, with duplicates combined. You do not get to overrule a must-fix. If a finding contradicts a locked decision or the plan itself, do not fix it and do not drop it: mark it disputed and put it in front of the person.
4. The main Astra implementer fixes every confirmed must-fix finding itself; no reviewer or coding child writes fixes. Notes are not work. Re-run only the affected checks and journeys.
5. Follow up. Send each reviewer that reported must-fix items its own items, the fix diff and current commit. It confirms each item is resolved and says whether the fix introduced anything new. Follow-ups stay limited to those items and the fix diff, not another whole-feature review.
6. If an original must-fix remains or a fix introduces another, correct it and repeat affected checks, qa journeys and reviewer follow-up. Record each attempt and its evidence. Do not add work from nonblocking notes or reopen locked decisions. If the same finding persists without progress, diagnose it and choose a different evidence-backed in-scope approach rather than repeat an unchanged attempt. Ask the reviewer to clarify a finding when needed; do not launch another implementer.

## Stop for a concrete reason, not a retry count

Apply the standing rules' stop conditions and explicit user limits. In particular:

- An unresolved must-fix alone is a reason to continue correction, not to stop after one or two rounds. Stop `failed` only when diagnosis and review evidence leave no viable in-scope repair.
- A missing decision, permission, or prerequisite that cannot be safely resolved in scope means `blocked`. When qa cannot log in, a service is unreachable, a tool is missing, or output is ambiguous, record affected checks as `undetermined` and diagnose the cause. Never turn an undetermined check into a pass or make speculative product edits to hide an environment problem.
- A reviewer cannot be launched. That is a missing capability, not a pass. One exception: in a single review, if `reviewer` cannot be launched, disclose the substitute before dispatch, update the top review metadata to single lane — Astra (Fable unavailable), and run `second-reviewer` in its place. Record the fallback in the pull request. This replaces the lane; it never adds a second one. If neither launches, or a dual review is short a reviewer, stop.

On a required stop: leave the pull request as a draft, and put the state and reason at the top of its description and in the status file: what is still open with evidence, what was tried, which checks are undetermined and why, and the exact decision, capability, or changed constraint needed to resume. Preserve the work rather than starting over. Set `question` for a blocker or explicit limit requiring the person's direction, and `failure` for an exhausted repair. More attempts do not authorize more scope, weaker checks, new paid services, or external actions.

## Clean up

Only once the review is accepted, or was skipped: [references/clean-up.md](references/clean-up.md). Then update the pull request's Review and Clean-up sections.
