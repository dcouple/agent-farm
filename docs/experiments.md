# Agent Farm experiments

## Fable 5.1 single-writer study

This experiment tests whether Claude Fable 5.1 produces cleaner, less sloppy,
less verbose, and more logical code than the Astra 6 baseline when Fable is the
only writer. Astra remains available as a focused root-cause advisor when Fable
is stuck and as a cold final reviewer before the PR is prepared. The study also
tests whether the raw harness is strong enough that the writer needs very few
skills.

The profiles are:

- `sw-fable-loop`: Fable 5.1, high reasoning, the same skill set as
  `sw-opus46-loop`, with process-mode Astra advisor and final reviewer children.
- `sw-fable-raw`: Fable 5.1, high reasoning, no loaded skills, with the same
  process-mode Astra advisor and final reviewer safety net.
- `sw-fable-solo`: Fable 5.1, high reasoning, the same skill set as
  `sw-opus46-loop`, with no subagents. This isolates the writer effect.
- `astra-implementer-high`: the Astra writer baseline.

The process mode on the Astra children is deliberate. Agent Farm rejects native
children whose harness differs from their parent; a Claude writer therefore
invokes the Codex advisor and reviewer through generated process dispatchers.
The existing advisor already covers evidence-backed root-cause investigation,
so this experiment does not add a separate investigator role.

### Expected outcome matrix

The experiment is successful if it measures the tradeoff rather than assuming
one model wins. “Cost” means the benchmark’s measured or estimated cost basis;
“speed” means wall-clock time.

| Fable quality vs Astra | Speed/cost vs Astra | Interpretation |
| --- | --- | --- |
| Higher | No slower and no pricier | New higher baseline: Fable quality at Astra efficiency. |
| Higher | Slower or pricier | Cleaner code at a quality premium; decide whether it is worthwhile. |
| Same or lower | Faster and cheaper | Efficiency without a quality gain; useful only if the tradeoff matters. |
| Same or lower | Slower or pricier | Same-or-worse quality, slower/pricier; Astra remains preferable. |

### Benchmark registration

The telemetry contender set is `sw-fable-solo`, `sw-fable-loop`, and
`sw-fable-raw`, compared with `astra-implementer-high` under the scheduler’s
one-new-contender-per-completed-trial rule. The HC2 candidate set for the frozen
`profiles compare` evaluator is the same three profiles against the
`astra-implementer-high` baseline. The live HC2 runner and evaluator are
intentionally not edited by this change; its frozen contract is consumed by the
benchmark owner after the profiles are installed.

## Cheap-model axis

The second axis tests whether a lower-cost writer can approach the Astra
baseline when Astra supplies a short plan and a bounded cold review/fix loop.
The target is parity on correctness and rubric quality within judge noise, with
wall time allowed up to 10x the named baseline and lower full-workflow cost.
The telemetry judge shortlist was not available when these profiles were
created; any later prompt improvement must be an append-only profile revision.

- `sw-luna-astra-loop`: Luna Max (`gpt-5.6-luna`, reasoning `max`) writes
  alone; native Astra advisor and final-reviewer children provide the plan and
  up to three review/fix rounds.
- `sw-deepseek-astra-loop`: the same single-writer architecture using
  `deepseek/deepseek-v4.1-flash`, the configured OpenRouter route, and native
  Astra children.
- `sw-luna-raw`: Luna Max with no skills and no subagents; the cheap raw
  control.
- `sw-luna-tdd-loop`: Luna Max with the same Astra loop, but it must add and
  demonstrate a failing focused test before production implementation.

Same-harness Codex children use `mode: native`; this differs from the Fable
profiles, whose Claude-to-Codex children require `mode: process`. The four
cheap profiles are intended for the overnight cohort on the frozen
`profiles compare` task; independent verification, dual blind judging, and
the ledger determine whether any result is a finding.

## Benchmark profiles from the 2026-09-19 hill-climb

These profiles were added to run a controlled comparison across models, effort
levels, harnesses and scaffolding shapes. Each isolates one variable so a result
can be attributed to something. They are experiment instruments first and
day-to-day profiles second, but several are directly usable.

**Raw controls — one model, no skills, no subagents.** These exist so every
other profile has something to be measured against.

- `sw-luna-raw`: Luna Max alone. The cheap-writer baseline, and the best
  price-to-hit-rate combination measured: 10 passes in 13 runs at $0.45 a run.
- `sw-terra-raw`, `sw-sol-max`, `sw-sol-high`: the same shape with a different
  writer model, to test whether the cheap-writer result is about Luna
  specifically or about cheap models generally.

**Effort ladder — same model and prompt, one config line changed.** Body text is
byte-identical across the ladder so the only variable is reasoning effort.

- `sw-astra-low`, `sw-astra-medium`, `sw-terra-high`, `sw-luna-high`. Blind
  judging found max never beat high while costing 84% more and taking 94%
  longer; below that the effort difference was smaller than the effect of
  rewording the prompt.

**Harness controls — identical model, different runner.**

- `hx-deepseek-claude`, `hx-glm-claude`: the same models as the existing
  `exp2` and `exp3` Codex profiles, moved to the Claude harness. The harness
  changed outcomes more than the model did, so run this pair before concluding
  anything about a model's capability.

**Split and orchestration shapes.**

- `sw-astra-orch-luna`: frontier model plans and reviews, `sw-luna-max-worker`
  writes every line. Buys frontier judgement and cheap labour separately. Scored
  best on fit-with-codebase while writing 40% less code than its peers.
- `sw-luna-max-worker`: the implementation worker the above delegates to. Not
  meant to be launched directly.
- `sw-luna-tdd-loop`, `sw-luna-astra-loop`, `sw-deepseek-astra-loop`: single
  cheap writer with a plan and a bounded review-fix loop, varying the writer and
  whether tests come first.

**Tri-model role assignment — three cheap models in different seats.**

- `tri-a-deepseek-write`, `tri-b-luna-write`, `tri-c-glm-write`: writer,
  reviewer and planner roles rotated across DeepSeek, Luna and GLM to test
  whether published per-model benchmark rankings predict role fit.

**Ensemble merge.**

- `sw-astra-merge-low`: reads several independent implementations of one ticket
  and assembles a final version. Writes no feature code itself. Runs at low
  effort because the work is reading and judging, not authoring.

Two cautions carried over from the run that produced these:

1. A profile that declares skills usually does not invoke them. Across 63 trials
   that declared at least one skill, 12 invoked one. Verify invocation in the
   logs before attributing a result to a skill.
2. An empty patch passes every verification gate, because the gates run against
   an unmodified checkout. Always check patch size before reading a pass.

## Reviewer profiles (`rv-`)

Added for the review benchmark. Each is a bare reviewer: one model, no skills, no subagents, with
**byte-identical body text** so the only variable is the model. They exist to measure the checking
half of the pipeline, which the writing experiments never touched.

- `rv-glm-claude`, `rv-deepseek-claude`: cheap outside models on the Claude harness.
- `rv-luna-max`, `rv-terra-high`: cheap native models on Codex.
- `rv-astra-low`, `rv-astra-medium`: the frontier controls.
- `rv-glm-targeted`: identical model and harness to `rv-glm-claude`, differing only in what it is
  told to look for. It exists to isolate instruction from model.

**The result these produced:** the instruction mattered far more than the model. Given a generic
"review this code", a frontier model found 1 of 5 known defects for $1.18. Given a targeted
instruction to verify each signal against the schema, a cheap model found 4 of 5 for $0.36. A single
cheap reviewer aimed at one class of problem found 4 of 5 for $0.15 in 9 minutes.

Running five cheap reviewers in parallel, each with a different lens, found all five defects for
about the price of one frontier run. Reviews are read-only, so they parallelise without conflict.

Two cautions:

1. **A single review is not reliable.** The identical reviewer run four times on identical code
   scored 5, 4, 4 and 3 of 5, missing different defects each time.
2. **Reviewers miss what generated tests catch.** Zero of five reviewers noticed a change that
   declared a command 68 times without wiring it into help text, which its own contract test catches
   deterministically. Run both.
