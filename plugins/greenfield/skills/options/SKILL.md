---
name: options
description: Use when the person asks what to do or for trade-offs, or more than one design is live. Waits for a pick. Never plans.
---

# Options

This is the only place alternatives are argued. If an implementer could still choose the architecture, this step was skipped.

## Rules

- One section per decision. Small decisions can be asked inline and recorded later in the plan cover sheet instead of getting a document.
- Two or three real options per decision, plus two that are always present: the **smallest version** (what ships if everything deferrable is deferred, and what the user loses) and **do nothing** (what stays wrong, observably).
- State each option's complexity-ladder rung from the standing rules, and give a reason for every rung above the lowest workable one.
- Include a concise complexity statement for each option, including the smallest version and doing nothing. Assess both the feature requirements and implementation direction: what complexity is added relative to today, likely bug/failure modes, and ongoing maintenance or operational burden. Explain which requirements drive that cost and what could be simplified or deferred, alongside the user value lost. Use concrete repository evidence where available and label assumptions; avoid invented scores, bug probabilities, or precise effort estimates. Follow the template guidance.
- Recommend one option and say what the person must accept if they take it.
- A decision blocked on a missing fact becomes a spike or a question for `researcher`. Do not guess the fact.
- Revise the document in place as the person learns. Record why options changed under "What we learned".

## Socrates

When the person says they are ready to pick, send the brief and this document to `socrates` once, with repository access. Relay its material questions. Record its verdict (pass, clarify, or rethink) against the revision it reviewed. Continue the same Socrates agent through follow-ups, two rounds at most. Socrates investigates facts and asks questions. The person settles product choices. Skip Socrates for small decisions.

## Output

An HTML page for the person, laid out as in [references/options-template.md](references/options-template.md) and rendered with the `page` house standard. Save it as `options.html` in the work's bundle. End with the status line and wait.

## Banned

- Implementation steps, file-level changes, work packages
- Picking on the person's behalf
- Starting the plan before there is an explicit pick
