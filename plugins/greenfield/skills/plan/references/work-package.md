# Work package

The unit that gets routed and executed. One package, one fresh context.

## Rules

- Each package leaves the repo in a working state and is short enough to paste into a fresh context. Five to fifteen steps. Do not over-split: several tiny packages cost more in handoffs than they save.
- Steps are actions on named files, not principles.
- Done-when checks must be observable by a stranger. Tag each check by who can prove it: `command` (tests, lint, a script), `journey` (a user flow in the running app), or `visual` (a screen matching the design reference).
- Give the package a level, `economy` or `standard`, with one line of why: [levels.md](levels.md). Never name a model.
- Write escalate-if conditions: the specific discoveries that mean the package's assumptions were wrong.
- Write forbidden items: the scope creep you can predict.
- If a decision is still open, ask the person now. Never write "TBD" or "use your judgment".
- Do not tell the implementer to think step by step, run every test in the repo, read architecture documents before every edit, or spawn agents. Point to a document only in the package that needs it.

## Example

```
## WP-04: Add invoice PDF export
level: standard
why:   has journey and visual checks, so it can be wrong while compiling
depends on: WP-02
max attempts per tier: 1

Goal
  Export the current invoice as a PDF from the invoice detail page.

In scope
  - app/invoices/[id]/page.tsx   add Export button
  - lib/pdf/invoice.ts           generate PDF with existing branding

Out of scope
  - emailing the PDF, changing invoice layout, new dependencies

Context to read (only these)
  - lib/pdf/quote.ts             copy this pattern
  - app/invoices/[id]/page.tsx

Steps
  1. Mirror quote.ts export for invoices.
  2. Wire the button. Disable it when invoice status is draft.
  3. Add or adjust tests for draft and issued invoices.

Done when
  [ ] command   pnpm test tests/invoices passes
  [ ] command   no new packages in package.json
  [ ] journey   issued invoice: button downloads invoice-{id}.pdf
  [ ] journey   draft invoice: button disabled
  [ ] visual    Export button matches mockups/invoice-detail.png

Escalate if
  - the quote pattern cannot map to invoices without a new layout
  - tests need fixture changes beyond these files

Forbidden
  - redesigning the PDF, refactoring unrelated code, spawning extra agents
```
