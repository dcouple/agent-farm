# greenfield

Role-named profiles that hand work to each other through documents, not conversation. The strongest model thinks and plans alone. Cheaper models execute work packages written for them. Verification starts after implementation, with targeted revalidation after fixes.

`greenfield` is self-contained: it shares no files with the `dcouple` plugin, so the two can be installed side by side and compared on the same work. It is at an early version. The planner and implementer paths are the ones to try first. The `orchestrator` profile is experimental and will change.

## What is in this folder

- `profiles/`: `planner`, `planner-codex`, `bug-reporter`, `implementer`, `implementer-fast` (a preset of `implementer`), `one-shot`, `free-range`, `free-range-claude`, `orchestrator`
- `agents/`: one per profile except `implementer-fast`, plus the children `socrates`, `investigator`, `researcher`, `plan-reviewer`, `mockup-artist`, `worker`, `advisor`, `qa`, `reviewer`
- `instructions/`: `standing-rules.md`, `implementer-identity.md`, `planner-documents.md`, `planner-identity.md`
- `skills/`: sixteen, each bound to an agent that calls it

| Skill | Used by | For |
| --- | --- | --- |
| `explain` | planner | Help a person understand. Explainer page when the concept is worth keeping |
| `brief` | planner | Capture the problem and the outcome wanted. File the issue |
| `options` | planner | Argue alternatives and wait for a pick |
| `spike` | planner | Answer one fact that blocks a decision |
| `plan` | planner, one-shot (format only) | Cover sheet, PLAN.md, work packages, handoff cards |
| `mockup` | planner | Three interface options per round. The approved one becomes the design reference |
| `page` | planner, orchestrator, one-shot | House standard for every HTML page written for a person |
| `bug-intake` | bug-reporter | Reproduce, rank hypotheses, write the report, choose a route |
| `work-packages` | implementer | The cycle up to the pull request: intake, preflight, who builds each package, verification |
| `final-review` | implementer | One initial independent review (two reviewers for a dual review), targeted corrections and follow-ups until accepted, then clean-up |
| `build-package` | implementer, worker | Implement one package from its handoff card |
| `open-pr` | implementer, one-shot | Commit, push, and open a draft pull request that teaches the change |
| `verify-app` | qa | Drive the running application and return a verdict with evidence |
| `gather-evidence` | investigator | Answer one factual question about the code or a running system |
| `web-research` | researcher | Answer one question from outside sources, with citations |
| `orchestrate-sessions` | orchestrator | Launch profiles across worktrees, poll, relay questions, keep the status board |

`socrates`, `plan-reviewer`, `reviewer`, and `advisor` carry no skill. Each does one judgment task, and its instructions are its agent file. `free-range` has none by design.

`mockup` has two methods. The planner runs on Claude, which has no image generation tool, so for images it calls `mockup-artist`, a Codex child that does. For exact text, real data, or a later pixel comparison it builds the options in HTML and CSS itself.

## Profiles

| Profile | Harness and model | Job | Stops when |
| --- | --- | --- | --- |
| `planner` | Claude, Fable 5.1 high | Discuss and explain by default. Brief, options, spike, and plan only when asked. Never writes code. May hand a trivial task straight to the implementer, with your yes | Every work package has observable checks and leaves no decision open |
| `planner-codex` | Codex, Astra high | The same planner on Codex: same skills and the same `planner-identity.md`, so the two can be compared on the same problem. Its children run on their own Codex defaults, `socrates` runs on Astra, and it draws mock-up images itself, so it has no `mockup-artist` | Same |
| `bug-reporter` | Codex, Sol high | Reproduce, write the report, choose a route | The report is filed. No fix is proposed |
| `implementer` | Codex, Sol medium | Intake check, preflight, route packages, execute one at a time, qa, independent review (two when the plan says `Review: dual`), targeted corrections and revalidation, clean-up, draft PR | Required checks and qa pass and review is accepted. Stops for a genuine blocker, exhausted in-scope repair, or explicit user limit, not a fixed retry count |
| `implementer-fast` | Codex, Astra medium, fast tier | A profile preset, not a second agent: `implementer` with a saved model override and `priority: speed` | Same |
| `one-shot` | Codex, Astra medium, fast tier (`--model gpt-5.6-sol` for Sol) | One model does whatever the work needs, its own way: no packages, no workers, no preflight, no reviewers. A plan's decisions, scope, and checks bind it. Its steps and levels are advice. Its skills (`plan`, `page`, `open-pr`) are there for their formats only, so plans, pages, and pull requests come out in the house form and publish to the `docs` destination | The work is done and a draft pull request is open. Or `blocked`, or `failed` |
| `free-range` | Codex, Astra medium | The raw model. No skills, no pipeline. Also the control when measuring whether skills help | You say so |
| `free-range-claude` | Claude, Fable 5.1 high | Same, on Claude | You say so |
| `orchestrator` | Claude, Fable 5.1 medium | Launch the profiles above across worktrees, poll status files, relay questions, keep one status board. Writes no code | The run summary is written |

Install it next to `dcouple`, then use qualified names. Bare `planner` and `implementer` are ambiguous once both plugins are installed, unless you set `default_plugin` in `settings.json`.

```sh
agent-farm plugin install greenfield
agent-farm profiles list

agent-farm run greenfield/planner --directory /path/to/project
agent-farm run greenfield/bug-reporter --directory /path/to/project
agent-farm run greenfield/implementer --directory /path/to/project/worktrees/feature \
  --arg source=docs/agent/plans/feature/PLAN.md
agent-farm run greenfield/implementer-fast --directory /path/to/project/worktrees/hotfix
```

To work on the plugin without installing it, point `--config-root` at this folder and use bare names:

```sh
agent-farm plugin validate plugins/greenfield
agent-farm run planner --config-root /path/to/agent-farm/plugins/greenfield --directory /path/to/project
```

## Launch arguments

`planner`, `orchestrator`, and `one-shot` declare `docs`, where documents are published. `implementer` declares `priority` (`usage`, `speed`), `review` (`none`, `single`, `dual`), `parent` (a status file path), and `source`. `bug-reporter` declares `parent` and `source`. Agent Farm rejects anything else and lists what is accepted. The values reach the agent as a `LAUNCH CONTEXT` block at the end of its instructions, which `instructions/standing-rules.md` explains how to read. They are requests to the model, not switches: `review=none` asks the implementer not to call the reviewers, it does not unbind them. `single` is the default, and a plan whose header says `Review: dual` still gets two reviewers.

`--model`, `--reasoning`, and `--speed` override the entry agent's model for one launch, which is how to A/B a different lead on the same plan:

```sh
agent-farm run greenfield/implementer --model gpt-5.6-luna --reasoning max --arg source=...
```

## Child agents

Children are not profiles. Each fires at a defined stage; corrections can require targeted follow-ups.

| Child | Bound to | Fires when | Model |
| --- | --- | --- | --- |
| `socrates` | planner, planner-codex | Once, when the person is ready to pick an option. Argues for less | Fable 5.1 high. Astra high under planner-codex |
| `investigator` | planner, planner-codex, bug-reporter | One evidence question, with a fresh context | Sonnet 5 under planner. Luna max elsewhere |
| `researcher` | planner, planner-codex | A question the codebase cannot answer | Sonnet 5 under planner. Luna max under planner-codex |
| `plan-reviewer` | planner | Once, on the finished PLAN.md: what would an implementer still have to decide? | Sonnet 5 under planner. Luna max under planner-codex |
| `mockup-artist` | planner (not `planner-codex`) | A separate headless Codex run, when `mockup` wants generated images. Given the scope, screenshot paths, and a folder. Returns image files | Sol medium |
| `implementer` | planner | A separate headless run, only for a trivial task you approved | its own |
| `worker` | implementer | A package the plan marks `economy` | Luna max |
| `advisor` | implementer, orchestrator | The caller is stuck, about to deviate, or about to declare risky work done | Astra high |
| `qa` | implementer, bug-reporter | After the last package when the plan has journey or visual checks, and for affected journeys after fixes. Also to reproduce bugs that need the running app | Sol medium |
| `reviewer` | implementer | Once, when the feature is supposed to be finished. On the other vendor's model, bound as a process child on Claude | Fable 5.1 high. Astra high is the agent file's own default |
| `second-reviewer` | implementer | Same moment, independently, only for a dual review: the plan says `Review: dual` or the launch says `review=dual`. The same `reviewer` agent file as a native child. Also stands in when `reviewer` cannot launch | Astra high |

The planner's evidence and review children reuse the shared agent files with a model override on the binding, so they run natively on Claude. Four bindings cross harnesses and run as separate headless processes: the planner's `mockup-artist` and `implementer`, the `reviewer` of `implementer`, and the orchestrator's `advisor`.

## Where instructions live

| Layer | Answers | Lives in |
| --- | --- | --- |
| Identity | Who am I, what do I produce, which skill for which request, when do I stop, what do I never do | Body of `agents/<name>.md` |
| Standing rules | Documents as the interface, complexity ladder, approvals, stop conditions, launch context, status file | `instructions/standing-rules.md`, included by each profile through `instructions_files` |
| Implementer identity | Kept as an include so the agent file stays short | `instructions/implementer-identity.md` |
| Skill | How to do one repeatable thing: template, format, bans | `skills/<name>/SKILL.md` and its `references/` |
| Repo knowledge | How this codebase builds, tests, and deploys | The target repository's own AGENTS.md or CLAUDE.md |

## Documents

Pages for people are HTML. Files for agents are plain text in the worktree.

**Bundles.** Every page for one piece of work lives in one folder with fixed file names and relative links: the brief as `index.html` (the hub), then `options.html`, `cover-sheet.html`, `explainers/`, `mockups/`, `evidence/`, and a small `bundle.json`. Because links are relative, a bundle works unchanged from disk, zipped, or published anywhere. The standard is `skills/page/references/bundle.md`.

**Destinations.** No skill depends on a platform. A bundle is local by default, in `tmp/greenfield/<slug>/` in the project. It is published elsewhere only when a destination is named, in this order: what you say in the conversation, the `docs` launch argument, a standing preference in the Agent Farm workspace instructions or the target repository's own AGENTS.md, then the local default. Publishing uses whatever tools the session has for that destination, updates the same container every time (`bundle.json` remembers its id), stays private unless you ask, and falls back to the local bundle with a plain statement if it fails.

```sh
agent-farm run greenfield/planner --arg docs=grain          # a named destination
agent-farm run greenfield/planner --arg docs=~/work/specs   # a path
```

To make it standing for a project, put it in the `instructions` of that project's `.agent-farm/workspace.yaml` (which also carries the connection that publishing needs) or in its AGENTS.md, for example "Publish planning documents to the Grain workspace for this repository."


| Document | Written by | Template |
| --- | --- | --- |
| Explainer (HTML) | planner, `explain` | `skills/explain/SKILL.md` |
| Brief (HTML) | planner, `brief` | `skills/brief/references/brief-layout.md` |
| Options (HTML) | planner, `options` | `skills/options/references/options-template.md` |
| Spike | planner, `spike` | `skills/spike/SKILL.md` |
| Plan cover sheet (HTML) | planner, `plan` | `skills/plan/references/cover-sheet.md` |
| PLAN.md | planner, `plan` | `skills/plan/references/plan-md.md` |
| Work package | planner, `plan` | `skills/plan/references/work-package.md` |
| Handoff card | planner, `plan` | `skills/plan/references/handoff-card.md` |
| Bug report | bug-reporter, `bug-intake` | `skills/bug-intake/references/bug-report.md` |
| Review report | `reviewer`, `second-reviewer` | section order in `agents/reviewer.md` |
| qa report | `qa` | `skills/verify-app/SKILL.md` |
| Pull request description | implementer, `open-pr` | `skills/open-pr/SKILL.md` |
| Mock-ups | planner, `mockup` | `skills/mockup/SKILL.md` |
| Status file | any headless profile | `instructions/standing-rules.md` |
| Ledger and status board | orchestrator | `skills/orchestrate-sessions/references/` |

Flow: explainer, brief, options (with spikes as needed), the person picks, plan, handoff card, pull request, review report. Or: bug report, then either straight to the implementer or to the planner for options.

## Preflight, review, and the failed state

**Preflight.** Before changing code the implementer confirms the result can be verified: check commands run, the app starts and browser automation is available when there are journeys, test accounts and test-mode keys exist, the design reference opens, it can push and open a pull request, and the reviewer can launch. The planner lists what is needed under "Verification needs" in PLAN.md. Anything missing means `blocked`, and nothing is attempted.

**Review.** One reviewer on the other vendor's model reviews the finished commit once. The planner writes `Review: dual` in the PLAN.md header when a mistake would be hard to undo (schema, auth, payments, production side effects), and then a second reviewer on the lead's vendor reviews the same commit independently and the must-fix list is the union of both. A finding that contradicts a locked decision is marked disputed and goes to the person. Fix confirmed must-fix items and repeat targeted follow-ups until resolved. Reviewers check their own items and regressions introduced by the fix diff; they do not restart whole-feature review. Re-run affected checks and qa journeys on the changed head. Nonblocking notes do not become work.

**Clean up.** Once the review is accepted, the implementer removes what should not outlive the merge, in one deletion-only commit: scratch scripts, throwaway tests, debug output, spike code, committed qa artifacts (saved elsewhere first), and working documents under `docs/agent/`. It touches only files this run added, keeps tests that prove the feature, re-runs the checks, and ends its report with what was removed and what was left. It is skipped in a failed state, where the leftovers are evidence.

**Corrections and stops.** A standard package no longer fails merely because its first advisor-guided retry failed, and review or qa has no fixed correction-round cap. The implementer records attempts and evidence, diagnoses repeated failures, and uses the advisor to change approach when progress stalls. It stops `blocked` for a missing decision, permission, or prerequisite it cannot safely resolve, and `failed` when diagnosis and advisor input leave no viable in-scope repair. Explicit user time, spend, and attempt limits still apply. Keep the PR as a draft with the stop reason, remaining findings, and what is needed to resume. An undetermined check is never a pass; more retries never authorize weaker checks or more scope. The orchestrator still does not relaunch a failed session on its own.

## Levels, children, and work without a plan

**The plan gives the level.** The planner read the code and wrote the steps, so it marks each package `economy` or `standard`, with one line of why, using `skills/plan/references/levels.md`. It never names a model: each plugin maps levels to its own models. Here `economy` goes to `worker` and `standard` stays with the lead. The level is a starting point. A failed check promotes the package, and the implementer may start higher when a package is plainly harder than marked.

**The implementer decides when a child is worth calling.** Its instructions say when each child is allowed, not when it is required. `priority` (`usage` or `speed`) tells it what the run values when the two conflict, and it weighs a handoff's cost itself. `implementer-fast` is the same agent on a faster model with `priority: speed`.

**No plan.** For a trivial task (contained, reversible, no product or design choice) the planner may hand one sentence straight to the implementer, after you say yes. The implementer runs headless and opens a draft pull request labelled `no-plan`, with "No plan was written for this change." as its first line. The same label applies to any task you give `implementer` or `one-shot` without a plan. Under `implementer`, review still runs unless the change is low-risk.

## Headless runs and the orchestrator

The orchestrator launches a profile headless with its qualified name and passes context as launch arguments:

```sh
agent-farm run greenfield/implementer --exec --directory ../worktrees/<slug> \
  --arg parent=../worktrees/<slug>/.agent/status.json \
  --arg source=docs/agent/plans/<slug>/handoff/WP-01.md
```

A headless profile logs small choices as assumptions, and stops with `state: blocked` and a question when a real decision appears. The orchestrator polls status files, not transcripts. Add `.agent/` to the target repository's `.gitignore`.

## Comparing with the earlier design

Run the same plan through each and compare cost, wall-clock time, must-fix findings from the same reviewer, and human minutes to merge:

- `free-range`: the raw model, as the control
- `one-shot`: one frontier model on the fast tier builds it all, with the house formats and no review, to measure what packages, workers, and review add
- `implementer`: standard lead with economy workers
- `implementer-fast`: frontier lead on the fast tier
- `astra-implementer-high`: the earlier design, a frontier orchestrator with economy workers and economy reviewers

Every launch reports a trace identity, `greenfield/<profile>@<version>`, plus the resolved model and arguments, in `--explain`, `--print-launch`, and the bundle's `agent.json`. Use it to tag runs.

Export telemetry from your shell before launching (`CLAUDE_CODE_ENABLE_TELEMETRY=1` for Claude Code, an `[otel]` block in Codex's `config.toml`). Agent Farm passes the shell environment through to the harness.

## Still missing in Agent Farm

| Gap | Workaround here |
| --- | --- |
| No configuration for harness environment variables, and no tracing integration | Export telemetry variables in the shell |
| No run registry or status envelope, and a finished process child cannot be resumed | The status file and ledger formats defined here. The second reviewer's follow-up is a fresh instance given its own findings and the fix diff |
| No tier map: model names are written in each agent file | Find and replace. Use `--model` for one-off comparisons |
| One agent file cannot launch on either harness | `free-range` and `free-range-claude` are separate agents |
