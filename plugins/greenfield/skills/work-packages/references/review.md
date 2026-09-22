# Verify, correct, and revalidate

1. If the plan lists journeys or `visual` checks, send them to `qa` with the design reference. Skip qa for copy, config, docs, and other low-risk changes. When a person is present, ask before starting qa. When headless, run it.
2. When qa reports a product bug, fix it in the owning package, rerun affected command checks, and send qa the new commit and affected journeys to revalidate. Repeat for actionable failures; do not treat partial or undetermined qa as passing. Missing capabilities go back to the implementer for safe in-scope diagnosis or a concrete blocker, not speculative product edits or weaker checks.
3. Open the pull request with `open-pr`, as a draft. Never merge.
4. Run the `final-review` skill: initial review, targeted fixes and follow-ups, then clean-up. Revalidate qa whenever a review fix affects a journey or visual check.

An attempt count alone does not end the run. Follow the standing rules for explicit user limits, genuine blockers, or failure when diagnosis and advisor input leave no viable repair inside the plan. Preserve the current work and evidence when stopping.
