---
name: plan
description: Use when the direction is chosen and the person wants a plan. Writes a high-level HTML cover sheet with package outcomes and explicit validation criteria. Never implements.
---

# Plan

Write the context a capable Astra implementer needs, not instructions for a weaker worker. The approved cover sheet is the single implementation handoff. Do not generate PLAN.md, per-package markdown cards, file allowlists, model tiers, or exhaustive step-by-step implementation recipes.

## Establish the outcome

Use the existing brief, approved design, and decisions. Resolve genuine product choices with the person; do not ask them to approve routine implementation details. A trivial task can use the existing one-sentence handoff instead of a plan. When alternatives remain unresolved, use `options`.

Inspect enough of the repository to identify the affected surfaces, integration boundaries, existing patterns, and verification prerequisites. Link a few useful entry points when known. Use a bounded investigator only for a specific unknown that matters to scope or validation; do not routinely fan out a full repository investigation. Do not construct a new test harness or repair the environment during planning. Record what the implementer must check during preflight, with known blockers distinguished from assumptions.

## One output

Write `cover-sheet.html` in the work's existing bundle using the `page` standard and [references/cover-sheet.md](references/cover-sheet.md). Both the person and the implementer read it. Preserve its published identity and links to the brief and approved designs.

Include:
- Outcome, scope and exclusions, high-level approach, constraints, locked decisions and deferred items.
- A short package table plus concise approach notes for each package on the same cover sheet: outcome, how it will be implemented, systems to reuse or extend, any new systems and why, schema/data changes (or none), meaningful dependencies, and relevant journey numbers or check names. Follow the package guidance in the cover-sheet reference; name confirmed integration points and distinguish assumptions from facts. Stages are checkpoints for one implementer, not dispatches or file restrictions. Cover every affected client and entry path, including alternate composers and adapters.
- The existing **How we will know it works** section: numbered journeys and whole-feature commands/suites, with clear observable outcomes and relevant prerequisites. Preserve this presentation; do not require a separate matrix or criterion IDs. Cover backend, frontend, integration, and design behavior that the feature actually needs. Include relevant identity/duplicate-name and notification edge cases when applicable, without adding generic checklists unrelated to the task.
- Known environment/fixture needs, required whole-feature checks, and what cannot yet be exercised. Distinguish a planned test from an observed pass. Missing capability never silently waives a required criterion.
- Top-of-page plan metadata must show `Review: single lane — Fable` by default. Before proposing dual review or no review, explain the mode and reason up front and ask the person for explicit approval. Record an exception as proposed/pending until approved, then show its mode, reason, and approval reference in the same metadata. Prior explicit user authorization suffices; an agent-selected setting does not. Never automatically choose dual based on risk. Exception: small, low-risk changes may skip review without asking; disclose that decision up front and record the reason in the top metadata, following `final-review`.

Keep it brief enough to read before coding. Explain the important technical approach without prescribing per-file edits, function signatures, or exhaustive steps. The implementer decides the concrete files and coding details. Do not duplicate the cover sheet in another implementation document.

## Review and handoff

Send the cover sheet and linked design to `plan-reviewer` once for scope coverage, consistency, and testability of the validation criteria. It should not demand file-by-file steps. Fix substantive omissions, then mark the plan ready for the person's approval and return its link. Do not launch planned implementation unless separately authorized under your role instructions.

When scope or a locked decision changes, revise the same cover sheet and affected criteria. Routine technical discoveries and additional in-scope caller files are handled by the implementer without a replan.
