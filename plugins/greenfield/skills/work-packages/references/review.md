# Verify, correct, and revalidate

1. Reconcile the cover sheet's “How we will know it works” section. Each required criterion needs an observed result, with evidence, on the current code. The implementer owns the backend and command checks; `frontend-verifier` drives the specified frontend journeys and visual states. Reuse stage evidence for unchanged behavior and run the remaining integration checks.
2. Use the verifier during implementation, and again at the end when frontend criteria need it. Already-authorized local checks need no extra permission; ask first only for an external effect that the standing rules put behind approval. Skip UI verification when no frontend behavior changed.
3. Fix product defects yourself, run the affected command checks, and ask the verifier to recheck only the changed journeys. A missing login, tool, or service leaves the criterion undetermined: diagnose it safely or report the exact blocker. Never weaken a criterion to turn it green.
4. Open or update the draft PR with `open-pr`. Run `final-review` for the final Fable review, make every fix yourself, and revalidate the affected criteria. Review follow-ups cover the findings and the fix diff.
5. Mark done only when every required cover-sheet criterion passes and the required review is accepted. On a concrete blocked or failed outcome, keep the work and respect explicit user limits. Never merge.

6. When implementation ends, publish `post-mortem.html` following the page bundle reference, and refresh the task-scoped `trace.html`. Explain blockers, surprises, deviations from the approved approach, and the actual verification and review outcomes. Update the hub and cover-sheet contents and the bundle metadata. Label ongoing snapshots and missing capture as such.
