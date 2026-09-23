# Cover-page presentation

Based on the user-provided “Plan: Agent-started Grain setup” v3 sample (23 September 2026). Preserve its readable narrative and package-card structure; do not inherit its legacy PLAN.md/handoff-card dependencies, worker tiers, or automatic dual-review rule.

## Page structure

- Center a single reading column around 46rem wide, with comfortable line height, restrained green accents, subtle borders, and light/dark themes. Adapt to narrow screens; allow wide tables/diagrams to scroll when needed.
- Lead with the feature title, a one-line outcome, and compact status/version/review metadata. Keep a linked contents/related-files navigation near the top.
- Show the before/after diagram early, with a caption explaining which systems already exist and what this work changes. Use real behavior, not decorative architecture.
- Add a visible **What you are approving** callout: scope in a few sentences, the most consequential choice, and packages worth close attention. No mandatory generic warnings.
- Keep **In three sentences**, compact **Decisions locked** and **Deferred** tables, scope, vertically stacked **Constraints** and **Non-goals**, relevant ask-first callouts, and the existing **How we will know it works** numbered journeys and whole-feature checks.
- Use stacked package cards below, then an execution-order sentence, related files and change log. Reference the post-mortem and trace as they become available in the bundle.

## Package cards

Each card shows its ID/title, one-line outcome, and a small set of informative labels: **reuse**, **extend**, **new**, affected surface (such as backend or web), dependencies and status. Use **look at this** only for a real decision or risk, with the reason visible before expanding. Do not include economy/standard worker tiers; one Astra implementer owns all stages.

A native `<details>` disclosure titled **Approach, reuse, and affected areas** can hold the supporting technical detail. Use short labeled paragraphs for approach; reused/extended systems; new systems (or none); schema/data/contracts; and relevant checks. An optional short annotated tree or list can orient the reader to known modules, without becoming a file allowlist or a list of edits. Prefer a few useful boundaries over exhaustive paths.

All content needed for approval must exist in this HTML. Keep consequential decisions, schema/migration impact, and important risks visible in the card summary or approval callout. When exact UI wording, contract semantics, or a design state needs review, include it inline (or embed the approved design); never say “read the wording in PLAN.md.” Expandable detail may supply depth, but must not conceal an approval decision. Unknowns remain explicit; do not invent missing source facts.

Retain single-lane review by default, with the approved small-change skip exception and user approval for dual review. The sample's authentication-based dual-review rule is not part of this format.
