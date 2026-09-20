---
name: bounded-advisor
description: How a cheap writer uses a frontier advisor without handing it the bill. Exactly two checkpoints (plan, pre-final), one self-contained packet each, advisor at low effort. Measured reason: an unbounded Luna writer called its Astra advisor 10 to 14 times per task, spending 0.8 to 1.4M Astra tokens, a third to a half of what Astra alone spends to do the whole task.
---

# bounded-advisor

The advisor is the expensive part of you. In this study a Luna writer with an Astra advisor "on call"
called it 10, 12 and 14 times on one mid-size task, spending $2.25 to $3.91 of Astra against $4.42 for
Astra doing the task alone: a 36% saving where a public package reports 98%. The difference is not the
models; it is how many times the cheap one asks.

## Exactly two checkpoints

1. **Plan check, before the first edit.** Send the advisor your written plan: files you will touch, the
   existing definitions you will reproduce verbatim, the one place that decides each behaviour, the
   verification commands. Ask one question: "What in this plan is wrong or missing?"
2. **Pre-final review, after verification passes.** Send the diff summary (files, what each does) and
   the verification results. Ask one question: "What would you reject?"

Nothing else. Not when a test fails (read the test), not when a name is unclear (read the callers),
not for confirmation. If you are about to call the advisor a third time, write down why in your notes
and do not call it.

## The packet

Under 400 tokens of your own words plus the exact lines you cite. Never your history, never your
reasoning, never a file dump. The advisor answers one question in 400 to 700 tokens; if the answer
needs more, you asked two questions.

## Effort

The advisor runs at **low**. Astra low matched Astra medium on every seat this study measured (review
1 of 5 both, implement 2 of 2 both, merge). There is no seat where paying for high has been shown to
change the answer.

## What to report

Number of advisor calls (must be ≤ 2), the two questions asked, and whether either answer changed the
code. That is the whole point of the profile; a run that cannot state it is not measurable.
