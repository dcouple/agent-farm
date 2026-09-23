# greenfield

Plan with a high-level cover sheet, then let one Astra Low implementer build the feature and check its work at every package stage. A focused frontend verifier exercises the running UI during implementation. A Fable reviewer reviews the finished change; the same implementer makes all corrections.

`greenfield` is self-contained and can be installed alongside `dcouple` and `orchestra`. This version changes the default implementer from Sol with economy workers to Astra Low without implementation delegation. Existing detailed plans remain accepted, but new plans do not require markdown implementation plans or handoff cards.

## Profiles

| Profile | Entry model | Role |
| --- | --- | --- |
| `planner` (`planner:claude`) | Fable 5.1 high | Discussion, brief/options when needed, then the approved cover sheet |
| `planner:codex` | Astra high | The same planner workflow on Codex |
| `implementer` (`implementer:standard`) | Astra low | All implementation and corrections, package self-checks, frontend verification, final review, draft PR |
| `implementer:fast` | Astra low, fast service tier | Compatibility variant of the same implementer; sets `priority: speed`, never adds workers |
| `bug-reporter` | Sol high | Reproduce and write a report without fixing code |
| `one-shot` | Astra medium, fast service tier | Independent comparison profile; follows its own execution approach and uses house formats |
| `free-range` / `free-range:claude` | Astra medium / Fable 5.1 high | Raw-model comparison profiles without the Greenfield workflow |
| `orchestrator` | Fable 5.1 medium | Experimental coordination of separate work items/worktrees |

```sh
agent-farm plugin install greenfield
agent-farm run greenfield/planner --directory /path/to/project
agent-farm run greenfield/implementer --directory /path/to/project/worktrees/feature \
  --arg source=/absolute/path/to/bundle/cover-sheet.html
```

The implementer explicitly selects the standard service tier by default, overriding any inherited fast setting. Opt in to fast mode with `--speed fast` (reasoning remains Low):

```sh
agent-farm run greenfield/implementer --speed fast --directory /path/to/project \
  --arg source=/absolute/path/to/bundle/cover-sheet.html
```

The source can also be a published artifact link, legacy plan, direct bug report, or contained task. The implementer reads the actual cover sheet and its linked approved design. It does not require a second planning document.

For local development without installing:

```sh
agent-farm plugin validate plugins/greenfield
agent-farm run implementer --config-root /path/to/agent-farm/plugins/greenfield \
  --directory /path/to/project --arg source=/absolute/path/to/bundle/cover-sheet.html
```

Use a CLI that supports profile variants. If an older installed CLI reports `Unsupported prototype fields: variants, default`, keep its existing plugin installation and use this repository's built CLI until the CLI is updated:

```sh
pnpm build
node dist/cli.js run implementer --config-root plugins/greenfield \
  --directory /path/to/project --arg source=/absolute/path/to/bundle/cover-sheet.html
```

## Options and complexity

Options include a short complexity statement covering added codebase complexity, likely bug risks, ongoing maintenance, and the feature requirements driving that cost. Present meaningful simplifications or deferrals with the user value lost, alongside implementation alternatives. Ground claims in known systems and label assumptions; do not invent numerical scores. Carry the chosen trade-off into the plan.

## Planning and the finish line

The planner retains the HTML `cover-sheet.html` in the existing work bundle. It contains the outcome, scope and exclusions, locked decisions, high-level architecture context, approved design, meaningful risks, and concise package approach notes: how the work will be implemented, systems reused or extended, new systems and why, schema/data changes or none, dependencies, and relevant checks. Keep the summary table scannable and put longer approach notes in full-width sections on the same page. The implementer chooses concrete files, algorithms, and steps using repository patterns.

Every brief and plan cover sheet includes a linked table of contents and references to its other bundle files. Constraints and Non-goals occupy separate full-width sections stacked vertically, including on wide screens.

Keep the existing **How we will know it works** presentation: numbered journeys and whole-feature commands/suites, with observable outcomes and relevant prerequisites. No separate validation matrix or mandatory criterion IDs are needed. All requested behavior and approved visual states must be covered, including alternate entry paths when relevant. The planner records verification prerequisites and known blockers; it does not build a new harness as part of routine planning. One bounded plan review checks scope and testability.

Do not generate a detailed `PLAN.md`, per-package markdown handoff cards, economy/standard tiers, or file allowlists. Legacy templates remain marked as such only to interpret older sources. Planning is ready when the product decisions are settled and the finish line is testable, not when every coding choice is prescribed.

## Implementation and checks

There is one implementation writer. Astra Low builds every package and every correction itself, including tests. It cannot delegate implementation to a worker, another implementer, or a shell-launched coding agent. The implementer binding exposes no worker or advisor child.

At each package boundary it inspects the diff, follows the full caller/data path, runs focused checks, and records validation results. Routine in-scope adapter/file changes do not bounce to the planner. Behavior changes use the `tdd` skill; existing repository checks still apply.

The frontend verifier can run as soon as a UI stage is usable. Dispatch only the relevant criteria, exact routes/navigation hints, fixture/session, expected results, design reference, current revision, and evidence directory. It reuses the app and authenticated session, navigates directly, and captures the requested states instead of exhaustively touring the application. It reports findings and never changes code. Recheck affected journeys after fixes.

After all stages, reconcile the whole-feature “How we will know it works” section, open/update the draft PR, and obtain a Fable review. Fix confirmed must-fix findings in the same implementer; review follow-ups cover those findings and the fix diff rather than repeating the entire audit. Revalidate any criteria affected by corrections. Never merge.

Done requires all required criteria to pass with applicable current-code evidence and the required review to be accepted. Missing QA capability is `undetermined`, not success. Continue independent authorized work where useful, but report a concrete blocker when completion cannot proceed. Respect explicit time/spend/attempt limits and change the hypothesis when a failure repeats without progress.

## Children

| Child | Bound to | Model and task |
| --- | --- | --- |
| `frontend-verifier` | implementer | Sol low, native; focused UI navigation, journeys, visual evidence during stages and after fixes; read-only |
| `reviewer` | implementer | Fable 5.1 high, process; one final review and targeted follow-ups; read-only |
| `second-reviewer` | implementer | Astra high, native; only explicit dual review or documented fallback when Fable cannot launch |
| `socrates` | planner | Fable high (Astra high under Codex planner); challenge unnecessary scope |
| `investigator`, `researcher` | planner | Sonnet 5 high (Luna max under Codex planner); bounded evidence questions |
| `plan-reviewer` | planner | Sonnet 5 high (Luna max under Codex planner); cover-sheet completeness and validation quality |
| `mockup-artist` | Claude planner | Sol medium, process; generated design assets when needed |
| `implementer` | planner | Separate process only for an explicitly approved trivial-task handoff |
| `qa` | bug-reporter | Sol medium; reproduce a bug in the app |
| `advisor` | orchestrator | Astra high, process; advice about session coordination |

The old `worker` agent file is retained for legacy configurations but is not bound to the implementer. Neither verification nor review is an implementation delegation.

## Arguments and compatibility

`implementer` accepts `source`, `parent`, `review` (`single`, `dual`, `none`), and `priority` (`usage`, `speed`). `single` is always the default, using Fable. Except for small, low-risk changes, any dual or skipped review must be disclosed up front and explicitly approved by the user before proceeding; prior explicit user requests/flags suffice, but agent-generated settings do not. Show the review mode in the cover sheet’s top metadata, with the reason and approval reference for exceptions. Small, low-risk changes may automatically skip review without asking; disclose the skip and reason up front and in the top metadata. There is no automatic risk-based dual escalation. `priority` influences latency/usage tradeoffs without enabling worker routing. `--model` and `--reasoning` remain explicit per-launch overrides.

The `standard` and `fast` variant names remain compatible. Both run the same Astra Low implementation agent; `fast` additionally selects the fast service tier. `planner`, `orchestrator`, and `one-shot` also accept `docs`; `bug-reporter` accepts `source` and `parent`.

## Documents and destinations

One work item has one bundle: `index.html` (brief/hub), `options.html`, `cover-sheet.html`, `mockups/`, `explainers/`, `evidence/`, and `bundle.json`, as needed. The cover sheet is read by people, implementers, and reviewers. Use relative links and preserve the published identity on updates.

Destinations follow the conversation, then the `docs` argument, then standing workspace/repository preferences, then local `tmp/greenfield/<slug>/`. A standing Grain preference therefore publishes the same private artifact; a local working copy alone is not delivery. See `skills/page/references/bundle.md`.

A headless orchestrator passes the cover-sheet path/link as `source` and a status JSON path as `parent`. The implementer records stage, criteria, evidence, assumptions and blockers there. Legacy plans are inputs, not a requirement to generate new planning files. Trivial unplanned work retains the `no-plan` PR label.

## Skills and source layout

- `agents/` and `profiles/` define models, bindings, and launch arguments.
- `instructions/` defines shared roles, permissions, and completion rules.
- `plan` and its cover-sheet reference define the high-level handoff and “How we will know it works” section.
- `work-packages`, `build-package`, and `verify-app` define stage checks and focused verification.
- `final-review`, `open-pr`, and `babysit-pr` cover review, draft PRs, and CI follow-up.
- `explain`, `brief`, `options`, `spike`, `mockup`, and `page` support planning.
- `bug-intake`, `gather-evidence`, `web-research`, and `orchestrate-sessions` support the other profiles.
- `tdd` and `codebase-design` remain vendored unchanged from [mattpocock/skills](https://github.com/mattpocock/skills/tree/c55ee46073ed/skills/engineering/tdd), MIT; see `THIRD_PARTY_NOTICES.md`.
- `session-trace` supports requested trace artifacts; follow the session's explicit permission requirements for conversation capture/export.

Compare runs using the same approved feature, current-code validation, reviewer rubric, model/effort, costs, active elapsed time, and human intervention time. Record the resolved trace identity `greenfield/<profile>[:<variant>]@<version>`; the earlier multi-worker benchmark is not the new workflow.
