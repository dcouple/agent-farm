# Preflight

Before substantial implementation, make a bounded check of the cover sheet's validation prerequisites in the existing environment. Record the results once, and keep baseline failures separate from feature regressions.

- Confirm the relevant commands exist, dependencies and the test runner work, and narrow baseline checks run.
- For frontend criteria, check the provided URL or route, the app server or simulator, browser tools, and the test identity and fixture. Prove a basic authenticated path when one is required. Use `frontend-verifier` for a focused check if it helps.
- Open the approved design reference when visual criteria require it.
- Check required test-mode external services and permissions. Trigger external effects only when authorized.
- Confirm branch and PR access and the `reviewer` launcher before relying on them. Check that the cover-sheet header records the review mode and any approval:
  - Single lane is the default.
  - Dual or no review needs the person's explicit authorization. A small, low-risk change may skip review automatically, with the reason explained up front and recorded. Disclose any exception up front, and ask when approval is missing.
  - Dual review needs both reviewers. `final-review` describes the single-lane fallback.

Record each prerequisite as available, unavailable, or unknown, with evidence. When one is missing, mark the affected criteria undetermined and name the concrete blocker. Keep going with independent authorized implementation and checks while they are useful; the feature is done only when every required criterion is proven. Stop as blocked when no meaningful authorized work remains, or when resolving the gap safely needs a decision, a permission, or a capability you lack.

When the same setup failure repeats, diagnose it and try a different hypothesis. Respect explicit limits. Report an environment problem as an environment problem. Never weaken a validation criterion or change source code to hide one. If a capability disappears later, apply the same rule and keep the evidence.
