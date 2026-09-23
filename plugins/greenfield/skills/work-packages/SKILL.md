---
name: work-packages
description: Take an approved cover sheet, legacy plan, bug report, or task through single-agent implementation with package self-checks, frontend verification, and final review.
---

# Work packages

One Astra Low agent owns every package and correction. Never dispatch implementation to workers, another implementer, or an ad-hoc coding process. Packages are checkpoints, not separate agent sessions.

1. **Intake.** Read the cover sheet, its validation criteria, and linked approved design/brief. Accept a legacy PLAN.md/card without requiring new planning documents; ignore its economy/standard routing. A contained direct bug report or trivial task is one package. Clarify missing product scope, not routine file or algorithm choices. If the source is an artifact link, read or check out its files with the destination's tools so the actual cover sheet is available.
2. **Preflight.** Check the prerequisites for the required criteria using [references/preflight.md](references/preflight.md). Record baseline and environment limitations separately from feature bugs. Do not spend the run repeatedly attempting the same unavailable environment setup.
3. **Stage.** Use the cover sheet's package outcomes and dependencies. If stages are absent, make a short implementation checklist in the status record, tied to journey numbers or check names. Do not write an exhaustive markdown plan or cards. Choose concrete implementation details and required caller/adapter files yourself within scope.
4. **Build and self-check.** Use `build-package` for each stage. Inspect its diff, trace the full data/caller path, run focused checks, and record results by validation ID before moving on. Keep one source writer. Commit a coherent stage when its applicable checks pass; mark checks needing later integration as pending, never pass.
5. **Verify frontend as it becomes runnable.** Dispatch `frontend-verifier` with the affected journey numbers or check names, known URL/route and navigation hints, test identity/fixtures, expected result, design reference, revision, and evidence directory. You may continue independent backend work while it verifies a stable UI state; coordinate edits so its target does not change silently. The child reports findings, never fixes. Reuse its navigation/session context when possible and recheck affected journeys after your fixes.
6. **Correct.** Fix actionable failures yourself, re-run affected checks, and record the next hypothesis if an attempt fails. Routine technical discoveries do not require planner approval. Escalate a scope/locked-decision conflict, missing authorization, or prerequisite you cannot safely resolve. Follow standing-rule limits and stop conditions.
7. **Whole-feature validation.** Use [references/review.md](references/review.md). Reconcile every required criterion across packages and backend/frontend entry paths. Final verification must cover the current relevant code; old screenshots alone do not prove changed behavior.
8. **Final review.** Open/update the draft PR with `open-pr` and obtain the Fable review using `final-review` (unless explicitly waived under that skill). Make fixes yourself and request focused follow-up; do not restart full review for each package.
9. **Report.** Link the cover sheet, current revision, validation results/evidence, review and resolved findings, known limits, and clean-up disposition. Set done only when required criteria and review pass. Otherwise preserve work and report blocked or failed with the concrete reason.
