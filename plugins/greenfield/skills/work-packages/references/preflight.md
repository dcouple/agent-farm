# Preflight

Make a bounded check of the cover sheet's validation prerequisites before substantial implementation. Reuse the existing environment; do not build a separate harness as a prerequisite to every plan. Record results once and distinguish baseline failures from feature regressions.

- Confirm the relevant commands exist, dependencies/test runner work, and narrow baseline checks can run.
- For frontend criteria, check the provided URL/route, app/server or simulator, browser tools, test identity and fixture. Prove a basic authenticated path when required. Use `frontend-verifier` for a focused check if helpful.
- Open the approved design reference when visual criteria require it.
- Check required test-mode external services and permissions; do not trigger unauthorized external effects.
- Confirm branch/PR access and the Fable reviewer launcher before relying on them. Default to single lane. Dual or none requires explicit user authorization, except small, low-risk changes may skip automatically with an upfront explanation and recorded reason; disclose exceptions up front and ask if approval is missing. Check that the cover-sheet header records the mode and any approval. Dual requires both reviewers. Follow `final-review` for its documented single-review fallback.

Record each prerequisite as available, unavailable, or unknown, with evidence. If a prerequisite is missing, mark affected criteria undetermined and identify the concrete blocker. Continue independent authorized implementation/checks when useful; do not claim done until every required criterion is proven. Stop blocked when no meaningful authorized work remains or safe resolution requires a decision, permission, or unavailable capability.

When the same setup failure repeats, diagnose it and change the hypothesis instead of blindly retrying. Respect explicit limits. Never weaken a validation criterion, mislabel an environment problem as a product bug, or make speculative source changes to hide it. If a capability disappears later, apply the same rule and preserve evidence.
