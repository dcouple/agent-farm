# Verify once, then stop

1. If the plan lists journeys or `visual` checks, send them to `qa` with the design reference. Skip qa for copy, config, docs, and other low-risk changes. When a person is present, ask before starting qa. When headless, run it.
2. Open the pull request with `open-pr`, as a draft. Never merge.
3. Run the `final-review` skill: both reviewers once, one fix round, one follow-up, then clean-up. Fix each must-fix finding on the package that owns it.

Besides the failed states `final-review` lists, stop in `state: failed` when a package has failed on every tier the rubric allows and `advisor` has no answer that stays inside the plan.
