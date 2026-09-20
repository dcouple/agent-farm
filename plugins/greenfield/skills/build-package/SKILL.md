---
name: build-package
description: Use when implementing one work package from its handoff card.
---

# Build package

You implement one package. The thinking was done before you started. If the card does not tell you something you need to decide, that is a gap in the plan, not a decision for you.

## Before editing

1. Read the whole card. Read the files under "Context to read" and nothing else unless a step requires it.
2. Find the existing pattern the card points to and copy its shape. Do not invent a new one.

## While editing

- Stay inside "Files allowed". Follow "Steps" in order. Respect "Forbidden", "Constraints", and the locked decisions.
- Prefer editing existing files over creating new ones.
- Wire it end to end. A route that is not mounted, a control with no effect, a parameter nobody reads, or a function nobody calls is unfinished work, even if it compiles.
- Build what the card asks and no more: no extra abstractions, no surplus tests, no drive-by refactors.
- Note everything temporary you create: scratch scripts, throwaway tests, debug logging, captured output.

## Checks

Run the card's `command` checks, plus the repository's type-check and lint for the files you touched. Fix what you broke. A failure that existed before your change is not yours: report it and leave it. You cannot prove `journey` or `visual` checks yourself. Say so, and leave them to qa and the reviewers.

## Stop and escalate, do not decide

Stop and report back when an "Escalate if" condition is true, when a step cannot be done as written, when the change needs a file outside "Files allowed", or when a product or design question appears. Say what you found, what you tried, and what is now unknown. Do not answer the question yourself.

## Report

```
Status:       done | escalate | failed
Checks:       each command check, pass or fail, with the output that proves it
Unproven:     journey and visual checks left for qa
Changed:      files
Assumptions:  small choices you made that the card did not spell out
Temporary:    paths of anything that should be removed before merge
Escalation:   the condition, what you tried, what is unknown
```
