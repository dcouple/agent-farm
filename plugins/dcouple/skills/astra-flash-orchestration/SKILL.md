---
name: astra-flash-orchestration
description: The workflow policy for a frontier planner over cheap builders. Astra writes scope, design and per-phase briefs; DeepSeek Flash or GLM discovers, implements, tests and reports each phase; Astra reviews receipts once and accepts or issues a fix brief. Astra never builds, never advises mid-task, never polls.
---

# astra-flash-orchestration

A public package (astra-flash-orchestrator) reports a 98% cut in Astra usage with this division of labour:
Astra does scope, design and briefs; Flash discovers, implements, tests and reports; Astra reviews and
accepts or requests fixes per phase. This study measured the pieces separately and they hold: DeepSeek
and GLM on the Claude harness pass a clear contract (3 of 3 and 5 of 5), review at parity with a
bounded body (4 of 4 injected defects, 1 to 6 min, $0.02), and say no to false findings when told to
verify first (4 of 4 fixer runs rejected exactly the false ones). What did NOT hold was an Astra
advisor on call during the build: that shape cost 0.8x to 1.7x Astra alone. The saving comes from
Astra touching the task only at the phase boundaries.

## Roles

| step | who | profile | Astra turns |
|---|---|---|---|
| scope, design, phase briefs | Astra (you) | this profile | 1 |
| discover, implement, test, report | Flash | `hx-deepseek-timebound` (or `hx-glm-timebound`) | 0 |
| review the receipt and diff | Astra | `rv-astra-timebound` body, one pass | 1 per phase |
| apply accepted findings, refuse false ones | Flash | `fx-deepseek-verify` (or `fx-glm-verify`) | 0 |
| accept the phase | Astra | one line | 0 (same turn as review) |

## Rules Astra follows

1. Write each phase brief as a self-contained packet: files in scope, the exact literal tokens and
   contract lines the builder must reproduce, the verification commands, ACCEPT criteria, and a
   required report format ending in `FILES CHANGED:` and `VERIFY:` lines. Never pass your own thread.
2. Launch the builder as a detached process (`agent-farm run hx-deepseek-timebound --exec < brief`) in
   its own worktree, start the `codex-queue-wait` waiter, and END YOUR TURN.
3. On resume, read the receipt, then open at most the cited files. Review with the bounded body:
   scope first, staleness second, callers before asserting. One pass.
4. If findings: write a fix brief that says "you did not write this; verify each finding against the
   code; REJECTED line required", launch the fixer, end the turn. Do not fix anything yourself.
5. Accept when verification passes and your review has no HIGH left. Move to the next phase.
6. You never call `write_stdin`, `wait`, `sleep`, or re-list a directory while a builder runs.

## What to measure when running this
Astra tokens per phase (should be two short turns), builder cost, wall time, and pass rate against the
task's gates; compare with Astra alone on the same task. Report the Astra-token reduction as the
headline, since that is the quota the subscription meters.

Never quote a harness's own cost line for a proxied model. The Claude harness prices DeepSeek and GLM at
its default card (a $0.20 build printed as $15.20 on 2026-09-20). Report token counts from the receipt;
the reader prices them at the model's published rates. Report cached and uncached input separately: on
the same task the Luna arm read 33% fewer Astra tokens than the Flash arm and cost 14% more in Astra
dollars because its cache share was 70% against 89%.

Measured whole cycles on the Pane task, 2026-09-20 (brief, build, review, fix, accept): Flash builder
807k Astra tokens (−71%), $2.19 all-in (−50%), ~45 min; Luna xhigh builder 543k (−81%), $2.96 (−33%),
~33 min. Astra alone: 2.8M, $4.42, 10 min. The accept-after-fix resume cost Astra 32k to 96k tokens.

## Where lanes write
Every lane, builder or fixer, writes its receipt into its own directory `<receipts>/<lane>/` and ends by
writing `<receipts>/<lane>/meta.json`. The waiter counts `<receipts>/*/meta.json`; a fix job that wrote
`meta.json` one level up stalled the parent for 31 minutes on 2026-09-20.

## Never fork

Spawn children with `fork_turns: "none"`. A forked thread runs the parent's model regardless of the child's configured model; measured 2026-09-20, two Astra roots turned their cheap children into Astra this way. Put needed context in the packet instead.

## Borrowed from the upstream package, because ours lacked them

**Two review lenses, one pass.** Lens 1, specification compliance: map every acceptance criterion to code, a test or
observed behaviour; check names, types, failure and boundary cases, non-goals; detect placeholders and invented
requirements; confirm tests exercise the behaviour, not a stub. Lens 2, quality and risk: logic defects, data flow,
authorisation, concurrency, error handling, brittle mocks, weakened types, unwanted dependency or config changes.
Both lenses in the one batched review; findings go back in one correction request; one correction cycle by default.

**The builder's report contract.** STATUS (ready_for_review | blocked | failed); workspace and baseline; changed paths
and behaviour; each verification command with exit status and salient result; outstanding risks; decisions that need
the planner; the resume checkpoint if unfinished. The builder never accepts its own work. Green gates are a claim, not
acceptance: on 2026-09-20 both brief-* trees passed all six contract commands and each still carried a contract HIGH
that the review found.

**Two writers at most**, and only with independent scopes and genuinely separate workspaces; shared types, lockfiles,
routes, migrations and generated outputs are contention points and are serialised.

What we keep that upstream lacks: end the turn and be resumed (native wait cost the package shape 1.62M Astra tokens
against our 511k to 711k on the same task), never fork (`fork_turns: "none"`), builders on the Claude harness
(DeepSeek, GLM) or Luna xhigh with the time-bounded discipline body, and a verify-first fixer that refuses false
findings.
