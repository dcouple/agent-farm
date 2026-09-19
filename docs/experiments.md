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
