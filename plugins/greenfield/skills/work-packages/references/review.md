# Verify, correct, and revalidate

1. Reconcile the cover sheet's “How we will know it works” section. Each required criterion needs an observed result and evidence for the applicable current code. The implementer owns backend/command checks; `frontend-verifier` drives the specified frontend journeys/visual states. Reuse stage evidence for unchanged behavior and run the remaining integration checks.
2. Use the verifier during implementation and at the end when frontend criteria require it. No extra permission question is needed for already-authorized local checks; ask only for an external effect that standing rules require approval for. Skip unrelated UI verification for changes with no affected frontend behavior.
3. Fix product defects yourself, run affected command checks, and ask the verifier to recheck only changed journeys. Missing login/tool/service means undetermined; diagnose safely or report the exact blocker. Never weaken a criterion to turn it green.
4. Open/update the draft PR with `open-pr`. Run `final-review` for the final Fable review, make all fixes yourself, and revalidate affected criteria. Review follow-ups concern findings and the fix diff, not another full pass over the feature.
5. Mark done only when all required cover-sheet criteria pass and required review is accepted. Preserve work on a concrete blocked/failed outcome, respecting explicit user limits. Never merge.

6. After implementation ends, publish `post-mortem.html` using the page bundle reference, and refresh the task-scoped `trace.html`. Explain blockers, surprises, deviations from the approved approach, and actual verification/review outcomes. Update hub/cover-sheet contents and bundle metadata. Mark ongoing snapshots and missing capture honestly.
