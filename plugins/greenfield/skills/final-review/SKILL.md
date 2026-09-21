---
name: final-review
description: Use when the build is finished and a draft pull request is open. One independent reviewer once, two when the plan asks, one fix round, one follow-up, then clean up. Stops failed instead of looping.
---

# Final review

However the work was built, it ends the same way. Skip the review when the launch context says `review: none`, when the person tells you not to run reviewers, or when the change is copy, config, docs, or similarly low-risk. Say in the pull request that it was skipped and why.

## Review once

1. Decide how many reviewers. One is the default: `reviewer`, which runs on the other vendor's model. Two only when the plan's header says `Review: dual` or the launch context says `review: dual`: then `second-reviewer`, a native child, reviews the same commit at the same time. Record which it was, and why, in the pull request.
2. Send the material: the diff, the plan, bug report, or task it was built from, and any qa evidence. For `reviewer`, call the launcher named in your instructions with `--message`, and give it file paths and the commit, not pasted content. Do not tell a reviewer how to review, and do not show one the other's findings.
3. Take the must-fix list from the report. With two reports it is the union of both, with duplicates combined. You do not get to overrule a must-fix. If a finding contradicts a locked decision or the plan itself, do not fix it and do not drop it: mark it disputed and put it in front of the person.
4. Fix every must-fix finding. Notes are not work. Re-run only the affected checks and journeys.
5. Follow up once. Send each reviewer that reported must-fix items its own items and the fix diff. It confirms each item is resolved and says whether the fix introduced anything new. It reads only the fix diff.
6. Only if the follow-up reports issues introduced by the fix, do one more fix round and one more follow-up. That is the limit: at most two fix rounds.

## Stop in a failed state instead of looping

Stop, set `state: failed`, and tell the person, when any of these is true:

- A must-fix finding is still open after its fix attempt. Do not try the same finding a third way.
- The second fix round still leaves or introduces must-fix findings.
- A check cannot be determined: qa cannot log in, a service is unreachable, a tool is missing, output is ambiguous. Record it as `undetermined`. An undetermined check is never a pass, and it is not something more code changes will fix.
- A reviewer cannot be launched. That is a missing capability, not a pass. One exception: in a single review, if `reviewer` cannot be launched, run `second-reviewer` in its place and say so in the pull request. If neither launches, or a dual review is short a reviewer, stop.

On failure: leave the pull request as a draft, and put a failure summary at the top of its description and in the status file's `failure` field: what is still open with evidence, what was tried, which checks are undetermined and why, and your best guess at the cause, including a missing configuration or capability. Then stop. Do not keep working and do not start over.

## Clean up

Only once the review is accepted, or was skipped: [references/clean-up.md](references/clean-up.md). Then update the pull request's Review and Clean-up sections.
