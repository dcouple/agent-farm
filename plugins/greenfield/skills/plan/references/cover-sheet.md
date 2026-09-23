# Plan cover sheet

The HTML cover sheet is the plan for both the person and the implementer. Write it for a human: what is being built, what was decided, what could go wrong, and how they will know it works. Lead with the story and pictures. Show ask-first actions as call-outs, not buried in a list. Save it as `cover-sheet.html` in the existing bundle; no separate PLAN.md or handoff cards.

```text
Header                feature, one-line outcome, status chip:
                      draft | plan-reviewer: pass | approved | in build | done
Review metadata       single lane — Fable (default), alongside status at the top
                      exceptions: mode, reason, small-change skip or user approval status
Contents              section anchors and linked table of related bundle files

In three sentences    what we are building, the approach, what the user gets
Before / After        diagram or mock-ups. Embed the design reference here and
                      name the screens that must match it.

Decisions locked      table: decision | chosen | rejected | why, in one line
                      link to the options document
Deferred              table: item | why deferred | revisit when (a concrete trigger)

Scope                 included outcomes and affected backend/frontend surfaces
Constraints           stack, dependencies, style, safety
Non-goals             explicit exclusions, immediately below Constraints
Ask-first actions     only relevant actions under the standing rules

How we will know it works
  Journeys            numbered user flows to drive in the running app
  Whole-feature check commands and suites

Packages              table: stage | title | what it does in plain English |
                      depends on | status
Look at these first   the two or three packages you consider riskiest, and why.
                      Invite the person to cut any they would be nervous to
                      wake up to.

Change log            newest first. Scope/decision changes are recorded here.
```

Review defaults to single lane. Small, low-risk changes may automatically skip review; disclose the skip and reason up front and label it in the top metadata. Otherwise explain and ask before dual review or skipping review unless the person already explicitly authorized that mode. Show exceptions requiring approval as pending in the top metadata; a plan entry alone is not permission to proceed.

## Layout and linked contents

Constraints and Non-goals are separate full-width sections stacked vertically at every viewport width, never side-by-side cards or columns.

Every cover sheet has a visible **Contents & related files** navigation near the top: section anchor links plus a table of linked filenames/titles and their purpose. Include the brief, options, approved designs, explainers, evidence, and other existing bundle files; follow `../../page/references/bundle.md`. Keep it current when adding files, use relative links within the bundle, and verify targets before publishing. Do not link nonexistent planned files; if there are no related files yet, say so explicitly and retain the section links.

## Keep verification in the existing presentation

Retain **How we will know it works**, with numbered journeys and whole-feature commands/suites. This section is the finish line for implementation; do not replace it with a validation matrix, a separate criteria section, or mandatory criterion-ID columns. Preserve an existing cover sheet's presentation when updating it.

Write clear observable outcomes for the requested backend/frontend behavior and approved visual states in those journeys and checks. Include relevant prerequisites or known blockers where needed, in plain language. The implementer and frontend verifier refer to journey numbers or check names, record observed results and evidence in the work's status/evidence, and complete the required checks before marking the feature done. Missing verification remains undetermined, not a pass.
