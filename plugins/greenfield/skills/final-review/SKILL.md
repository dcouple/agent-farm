---
name: final-review
description: Use when the build is finished and a draft pull request is open. Independent review followed by targeted fixes, revalidation, and clean-up; one reviewer by default, two when requested.
---

# Final review

However the work was built, it ends the same way. Skip the review when the launch context says `review: none`, when the person tells you not to run reviewers, or when the change is copy, config, docs, or similarly low-risk. Say in the pull request that it was skipped and why.

## Review, then follow up on fixes

1. Decide how many reviewers. One is the default: `reviewer`, which runs on the other vendor's model. Two only when the plan's header says `Review: dual` or the launch context says `review: dual`: then `second-reviewer`, a native child, reviews the same commit at the same time. Record which it was, and why, in the pull request.
2. Send the material: the diff, the plan, bug report, or task it was built from, and any qa evidence. For `reviewer`, call the launcher named in your instructions with `--message`, and give it file paths and the commit, not pasted content. Do not tell a reviewer how to review, and do not show one the other's findings.
3. Take the must-fix list from the report. With two reports it is the union of both, with duplicates combined. You do not get to overrule a must-fix. If a finding contradicts a locked decision or the plan itself, do not fix it and do not drop it: mark it disputed and put it in front of the person.
4. Fix every must-fix finding. Notes are not work. Re-run only the affected checks and journeys.
5. Follow up. Send each reviewer that reported must-fix items its own items, the fix diff and current commit. It confirms each item is resolved and says whether the fix introduced anything new. Follow-ups stay limited to those items and the fix diff, not another whole-feature review.
6. If an original must-fix remains or a fix introduces another, correct it and repeat affected checks, qa journeys and reviewer follow-up. Record each attempt and its evidence. Do not add work from nonblocking notes or reopen locked decisions. If the same finding persists without progress, diagnose it and seek `advisor` guidance on a different in-scope approach rather than repeat an unchanged attempt.

## Stop for a concrete reason, not a retry count

Apply the standing rules' stop conditions and explicit user limits. In particular:

- An unresolved must-fix alone is a reason to continue correction, not to stop after one or two rounds. Stop `failed` only when diagnosis and advisor input leave no viable in-scope repair.
- A missing decision, permission, or prerequisite that cannot be safely resolved in scope means `blocked`. When qa cannot log in, a service is unreachable, a tool is missing, or output is ambiguous, record affected checks as `undetermined` and diagnose the cause. Never turn an undetermined check into a pass or make speculative product edits to hide an environment problem.
- A reviewer cannot be launched. That is a missing capability, not a pass. One exception: in a single review, if `reviewer` cannot be launched, run `second-reviewer` in its place and say so in the pull request. If neither launches, or a dual review is short a reviewer, stop.

On a required stop: leave the pull request as a draft, and put the state and reason at the top of its description and in the status file: what is still open with evidence, what was tried, which checks are undetermined and why, and the exact decision, capability, or changed constraint needed to resume. Preserve the work rather than starting over. Set `question` for a blocker or explicit limit requiring the person's direction, and `failure` for an exhausted repair. More attempts do not authorize more scope, weaker checks, new paid services, or external actions.

## Clean up

Only once the review is accepted, or was skipped: [references/clean-up.md](references/clean-up.md). Then update the pull request's Review and Clean-up sections.
