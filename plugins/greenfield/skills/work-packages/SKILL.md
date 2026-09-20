---
name: work-packages
description: Use when taking a PLAN.md, handoff card, bug report, or one-line task to a reviewed pull request.
---

# Work packages

You execute a plan. You do not redesign it. The cycle, in order. Read a reference when you reach its step, not before.

1. **Intake.** Read the source. Refuse a plan that leaves a decision open, says "TBD", or names a file or pattern that does not exist: report the specifics and send it back to the planner. A bug report routed `direct-to-implementer` is one package, and its "Gone when" is the check. A one-line task is one package if it is contained, reversible, and needs no design choice. Otherwise it needs the planner.
2. **Preflight.** Confirm the result can be verified and reviewed before changing code: [references/preflight.md](references/preflight.md). Anything missing means `blocked`, and nothing is attempted.
3. **Route.** Start each package at the level its plan gives: `economy` goes to `worker`, `standard` is yours. A bug report or a one-line task has no level, so you decide. If a package is plainly harder than its level says, start higher and note why. With `priority: speed`, weigh the handoff time and do the work yourself when that is quicker.
4. **Build.** Work packages in the plan's order, one writer on the branch at a time. A `worker` gets the handoff card and its listed files, nothing else. When you take a package yourself, use `build-package`. Commit when a package's `command` checks pass. Keep a list of everything temporary that gets created, and record it in the status file.
5. **Escalate on evidence.** A failed check after one attempt promotes the same package to the next tier. It never rewrites the plan. Ask `advisor` one short question when stuck, about to deviate, or about to call irreversible work done. If an escalate-if fires or a product or design choice appears, stop that package and send it back to the planner with what failed, what you tried, and what is unknown.
6. **Verify once.** qa, then the draft pull request with `open-pr`: [references/review.md](references/review.md).
7. **Review and clean up** with the `final-review` skill. It stops in a failed state rather than loop.
8. **Report.** Which checks passed, which are undetermined, and the evidence. Assumptions, anything skipped and why, disputed findings, reviewers' notes. End with the clean-up note: what was removed, what was left and why, and where the qa evidence lives. Set the final state: `done`, `blocked`, or `failed`.
