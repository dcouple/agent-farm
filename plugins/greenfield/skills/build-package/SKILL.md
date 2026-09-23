---
name: build-package
description: Implement and self-check one outcome stage from the approved cover sheet, using the surrounding repository context.
---

# Build package

You are the sole implementer. Read the stage outcome and proposed technical approach, reuse/extension choices, schema/data impact, relevant journey numbers or check names, locked decisions, design reference, and code needed to implement them. Select files and steps yourself using existing repository patterns; no handoff card or file allowlist is required.

## Implement

- Write the stage's code and tests yourself. Never delegate source edits or test implementation.
- Follow `tdd` for behavior changes and repository conventions. Keep checks proportional to the change.
- Trace the full path: caller, adapter, request, server validation, persistence, response, and every affected renderer. Check alternate entry points such as new-item composers, mobile, and portals when in scope.
- Preserve identity and state through edits/retries; use concrete edge cases from the cover sheet. A compiled helper that is not wired into the feature is incomplete.
- Choose normal technical details autonomously. Stay inside the approved outcome, constraints, and locked decisions; avoid unrelated refactors and abstractions.

## Check before advancing

Inspect the diff. Run stage-specific tests and required lint/type checks for affected code. Record each validation ID as pass, fail, or pending integration/undetermined, with command or journey evidence and the tested revision. Distinguish baseline failures from regressions.

For runnable UI stages, use the focused `frontend-verifier` dispatch described in `work-packages`. You may also drive the app yourself. A command test does not prove a live journey; retain that distinction. Fix failures yourself and rerun affected checks before claiming the stage works.

Keep a small status record: stage, changed paths, validation results, assumptions, temporary artifacts, and any blocker. Do not create a detailed per-stage handoff document. Escalate only a genuine product/scope decision, authorization need, or unresolved prerequisite; a necessary in-scope caller edit is ordinary implementation.
