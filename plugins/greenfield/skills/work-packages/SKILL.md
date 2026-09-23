---
name: work-packages
description: Take an approved cover sheet, legacy plan, bug report, or task through single-agent implementation with package self-checks, frontend verification, and final review.
---

# Work packages

One implementer agent owns every package and correction. Packages are checkpoints inside that one session. Never hand implementation to workers, another implementer, or an ad-hoc coding process.

1. **Intake.** Read the cover sheet, its validation criteria, and the linked approved design or brief. An older plan works as input too; take its requirements and checks. Treat a contained bug report or trivial task as one package. Ask about missing product scope; make routine file and algorithm choices yourself. If the source is an artifact link, read or check out its files with the destination's tools so you work from the actual cover sheet.
2. **Preflight.** Check the prerequisites for the required criteria using [references/preflight.md](references/preflight.md). Record baseline and environment limitations separately from feature bugs. When an environment setup keeps failing the same way, record it as a blocker and continue with the work it doesn't block.
3. **Stage.** Use the cover sheet's package outcomes and dependencies. If it has no stages, keep a short checklist in the status record, tied to journey numbers or check names. Choose the concrete implementation details yourself, including any caller or adapter files the scope needs.
4. **Build and self-check.** Use `build-package` for each stage. Inspect its diff, trace the full data and caller path, run focused checks, and record results by validation ID before moving on. You stay the only source writer. Commit a coherent stage when its applicable checks pass. Mark checks that need later integration as pending until they run.
5. **Verify frontend as it becomes runnable.** Dispatch `frontend-verifier` with the affected journey numbers or check names, the URL or route and navigation hints, test identity and fixtures, expected results, design reference, revision, and evidence directory. You may continue independent backend work while it checks a stable UI state; tell it whenever you change its target. It reports findings and you make the fixes. Reuse its navigation and session context where possible, and have it recheck affected journeys after your fixes.
6. **Correct.** Fix actionable failures yourself, re-run affected checks, and record the next hypothesis when an attempt fails. Handle routine technical discoveries yourself. Escalate a conflict with scope or a locked decision, missing authorization, or a prerequisite you cannot safely resolve. Follow the standing-rule limits and stop conditions.
7. **Whole-feature validation.** Use [references/review.md](references/review.md). Reconcile every required criterion across packages and across backend and frontend entry paths. Final verification runs against the current code, with fresh evidence for any behavior that changed.
8. **Final review.** Open or update the draft PR with `open-pr` and get the final review through `final-review`, unless it is explicitly waived under that skill. Make the fixes yourself and ask for a focused follow-up on them. One full review covers the whole feature.
9. **Report.** Link the cover sheet, current revision, validation results and evidence, review and resolved findings, known limits, and clean-up disposition. Mark the work done only when the required criteria and review pass. Otherwise keep the work and report it as blocked or failed, with the concrete reason.
