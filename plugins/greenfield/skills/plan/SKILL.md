---
name: plan
description: Use when the person says to write the plan or build it and the direction is chosen. Writes the cover sheet, PLAN.md, and handoff cards. Never implements.
---

# Plan

The plan is a contract for a weaker model, not a design essay. If the implementer still has to invent the product, the plan is not done.

## Before writing

- If the request is trivial, say it needs no plan, and follow your instructions for handing a one-sentence task to the implementer with the person's yes.
- If two designs are still live, stop and use the `options` skill first. Do not hide a choice inside a work package.
- Do not rewrite the conversation into a plan. Pull the facts into the brief or bug report, confirm the gist with the person in one paragraph, then plan.
- Interview until these are explicit: what done means for the whole feature, what is out of scope, hard constraints, and how it will be verified.
- Work out what it takes to verify the result, and list it under "Verification needs" in PLAN.md: test accounts, seed data, environment variables, test-mode keys, services that must be running. The implementer checks these before it starts. A check nobody can run is not a check.
- Read the code the plan will touch. Every file and pattern a package names must exist. Prefer existing patterns and name the file to copy.

## Two outputs

1. **Cover sheet**, an HTML page for the person. This is what they approve. Layout: [references/cover-sheet.md](references/cover-sheet.md). Render with the `page` house standard and save it as `cover-sheet.html` in the work's bundle.
2. **PLAN.md**, plain text in the worktree at `docs/agent/plans/{slug}/PLAN.md`. A short header and the work packages. Format: [references/plan-md.md](references/plan-md.md) and [references/work-package.md](references/work-package.md).

Implementers never read the cover sheet. Everything they need is in the package and its handoff card: [references/handoff-card.md](references/handoff-card.md). Write one card per package into `docs/agent/plans/{slug}/handoff/WP-nn.md`.

## Work packages

Each package leaves the repository working, carries observable checks, gives a level for who should build it, and leaves nothing for the implementer to decide. Read [references/work-package.md](references/work-package.md) before writing the first one, and [references/levels.md](references/levels.md) when choosing a level.

## Record what was decided and what was cut

The cover sheet carries a "Decisions locked" table (decision, chosen, rejected, one line of why) and a "Deferred" table (item, why, a concrete trigger for revisiting). Implementers and the reviewer treat locked decisions as closed.

## Gate

When the plan is complete, send PLAN.md to `plan-reviewer` once with one question: what would an implementer still have to decide, and do the named files and patterns exist? Fix what it finds. Then tell the person the plan is ready for approval, name the two or three riskiest packages, and stop. Do not launch an implementer.

## Replans

When an implementer bounces a package back, patch that package and, if a locked decision changed, the cover sheet's tables and change log. Leave the other packages alone.
