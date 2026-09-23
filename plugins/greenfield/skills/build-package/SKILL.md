---
name: build-package
description: Implement and self-check one outcome stage from the approved cover sheet, using the surrounding repository context.
---

# Build package

You are the sole implementer. Read what you need for this stage: its outcome and proposed technical approach, what it reuses or extends, schema and data impact, the relevant journey numbers or check names, locked decisions, the design reference, and the code involved. Choose the files and steps yourself, following the repository's existing patterns.

## Implement

- Write the stage's code and tests yourself. Never delegate source edits or test implementation.
- Follow `tdd` for behavior changes and repository conventions. Keep checks proportional to the change.
- Trace the full path: caller, adapter, request, server validation, persistence, response, and every affected renderer. Check alternate entry points such as new-item composers, mobile, and portals when in scope.
- Preserve identity and state through edits and retries, and use the concrete edge cases from the cover sheet. Wire every helper into the feature; code that compiles but nothing calls is unfinished.
- Decide routine technical details yourself. Stay inside the approved outcome, constraints, and locked decisions, and leave unrelated refactors and abstractions out.

## Check before advancing

Inspect the diff. Run the stage's tests and the required lint and type checks for affected code. Record each validation ID as pass, fail, pending integration, or undetermined, with command or journey evidence and the tested revision. Keep baseline failures separate from regressions.

For runnable UI stages, dispatch `frontend-verifier` as described in `work-packages`, and drive the app yourself too if that helps. Only a live run proves a journey, so record command tests and live journeys as separate evidence. Fix failures yourself and rerun the affected checks before calling the stage working.

Keep a small status record: stage, changed paths, validation results, assumptions, temporary artifacts, and any blocker. Escalate only a genuine product or scope decision, a need for authorization, or an unresolved prerequisite. Editing an in-scope caller is ordinary implementation.
