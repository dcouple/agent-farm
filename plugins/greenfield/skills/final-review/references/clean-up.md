# Clean up

Only after the review is accepted: both reviewers' must-fix items are resolved, or the person accepted what remains. Skip this step entirely in a failed state, because the leftovers are evidence.

Remove what should not outlive the merge:

- scratch scripts, throwaway tests, and fixtures that were only used to debug
- debug logging and commented-out code added during this run
- spike code that did not become part of the feature
- qa screenshots, videos, and reports committed to the branch. Move them to `evidence/` in the work's bundle, or attach them to the pull request, then remove them from the repository
- handoff cards and spike notes under `docs/agent/`, when the work had a plan. Keep PLAN.md only if the repository's conventions keep plans. Otherwise remove it and make sure the pull request links the cover sheet

Rules:

- Touch only what this run added. Compare against the base branch. Never delete a file that existed before you started.
- Tests that prove the feature stay. A test is temporary only if it was written to investigate, not to verify.
- Deletions only. This step happens after review, so it must not change behaviour. If removing something needs a code change beyond deleting lines this run added, leave it and list it.
- If you are unsure whether something should stay, leave it and list it.
- Make it one separate commit so it is easy to inspect or revert. Re-run the `command` checks afterwards. If any fail, revert the clean-up commit and report that instead.
