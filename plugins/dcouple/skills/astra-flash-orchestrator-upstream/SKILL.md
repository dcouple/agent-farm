---
name: astra-flash-orchestrator-upstream
description: Plan and execute substantial multi-file builds, features, migrations, and refactors with Astra as orchestrator and DeepSeek V4.1 Flash as the native Codex implementation worker. Use for phased planning and delegated build execution, including existing Superpowers or GSD plans. Skip trivial edits and explicitly single-agent tasks. Worker children must not invoke this orchestration skill.
---

# Astra plans. Flash implements. Astra accepts.

Use the existing Codex Router, not a second agent CLI or API client. This skill
provides the workflow; the custom agent and router select the worker model. Do
not claim routing is verified from these instructions or a worker's self-report.

## Supported orchestration workflow

There is no user-selectable mode switch. Thin-root orchestration is the only
supported delegated workflow. “Thin” distinguishes this design from older,
more Astra-active revisions; it is not one option in a mode menu.

Keep Astra focused on decisions where its judgment has the highest leverage:
architecture, acceptance criteria, material risk, and final acceptance. After the
contract is ready, Flash owns repository discovery needed within the brief,
implementation, testing, debugging, and routine browser/visual QA.

For a normal phase, target this root workflow: one planning batch, one dispatch to
one worker, one native wait, one batched acceptance review, and one final response.
This is a workflow shape, not a reason to skip evidence or stop before the result is
correct. Add Astra work only for a concrete blocker or architecture, security, or
production-risk concern. Do not create root activity merely to observe progress.

## 1. Orient and classify

Read the relevant repository guidance and current request. Preserve existing
work. Decide whether this is a direct small fix, a bounded build, or a large
multi-phase project. Keep trivial edits with Astra; do not force delegation onto
a typo or a simple question. For a substantial build, say what Astra will own
and what Flash will implement. These routing decisions are not alternate modes.

Use the user's existing approvals and decisions. An explicit request to plan and
build authorizes the in-scope workflow; it is not necessary to ask again after
every phase. Ask only about material unresolved product/risk decisions that
cannot be established from the repo. When asked to plan only, do not implement.

## 2. Confirm routing before delegating

Read `routing.json` in this installed skill and `references/routing.md`. Run the
read-only `scripts/doctor.py` with the same CODEX_HOME/profile used by the session.
Its output is a static configuration check, not an end-to-end model test.
Confirm the current ROOT is the user's selected GPT-6 Astra and that the native
`astra_flash_builder` role is available. Do not change the root model or effort.
Inspect project/CLI/UI/managed overrides that the doctor cannot resolve.

For an already-verified setup, reuse the verified configuration evidence rather
than repeating a paid smoke test per task. For a first routed task, use a small
real, useful implementation bundle and inspect host/router metadata afterward.
No fake model-name check and no silent fallback. If routing cannot be established,
finish the plan and report the execution blocker before delegating private work.

## 3. Design before dividing the work

Read `references/planning.md`. Reuse an approved design/spec and phase plan when
one exists. Superpowers, GSD, and custom plans are all valid inputs; do not create
a competing spec or force a framework migration.

For new work, produce an appropriately sized design covering objective,
non-goals, repo evidence, important alternatives, interfaces, failure behavior,
risks, and acceptance criteria. Put stable shared contracts ahead of dependent
implementation. Astra makes architecture, auth/security, tenancy, payments,
secrets, and production-impacting decisions; do not hand those decisions to
Flash under a vague "build it" prompt.

## 4. Produce a phase plan and executable briefs

Default artifact home: `docs/agent-work/<feature>/`. Follow an existing project
convention instead when one is established. Use the templates as needed.

Write a dependency-ordered phase plan. Prefer one coherent end-to-end vertical
bundle per phase when its contract is stable. Each Flash assignment has exact
contracts, a bounded file scope, testable outcomes, and verification commands.
Internal discovery, implementation, testing, debugging, and routine UI validation
stay with Flash; Astra does not write the entire implementation in the plan. Long
work is welcome inside a clear contract, not across unknown architecture boundaries.

Separate tasks only at genuine dependency or independent acceptance boundaries,
not for status visibility, every function, or every five-minute step. A phase can
contain multiple bundles when required; a bundle can contain multiple test/code/fix
cycles. Complete early phases first and refine later briefs when earlier interfaces
stabilize. If a machine-readable plan is useful, use
`templates/plan.json` and run
`scripts/validate_plan.py <plan.json> --repo-root <repository-root>` before launch.
That linter checks structure, not the truth or quality of the design.

## 5. Dispatch and let the worker work

Read `references/execution.md`. Use the host's actual native delegation tool with
the installed `astra_flash_builder` role. Do not invent a slash command or tool
signature. If the tool exposes explicit model selection, use the exact installed
worker slug. Do not use a default explorer/reviewer role that could override it.

Give the worker the full task brief plus the minimum shared context, required
contracts, task ID, working directory, baseline, and relevant dependency outputs.
Prefer a clean child context where the host supports it; never claim its context
is empty if the host actually inherits history. No unnecessary full-transcript
forking, duplicate repository investigation, or play-by-play log forwarding.

Default to ONE active Flash writer in the current workspace. A native subagent
is not automatically a Git worktree or a security sandbox. Astra must not edit
its claimed paths. Use two writers only when the plan explicitly identifies
independent work and each has a real, verified separate workspace. See execution
reference for dirty-tree, contract, and integration rules. No recursive agents.

Let the worker complete its internal implementation, testing, debugging, and
routine UI-validation loop. Use the longest practical native wait and allow it to
finish. Do not poll with status/list calls, request progress updates, interrupt a
healthy run, or perform overlapping repository work while the worker owns the
bundle. A wait timeout alone is not evidence that the worker is stuck. Set a
task-appropriate budget and checkpoint rule rather than assuming every job fits a
fixed time estimate. Resume the same worker for one consolidated review-fix cycle;
start a fresh context only for an unrelated bundle.

## 6. Review the actual result

Read `references/review.md`. Worker completion means **ready for review**, not
accepted. Astra reviews the actual patch against the captured baseline, including
untracked additions and pre-existing changes. Never treat HEAD as the baseline
without checking the workspace state.

Apply two review lenses in one batched Astra pass: specification compliance, then
code quality/security. Inspect the actual diff and the worker's evidence. Perform
targeted spot checks where evidence is missing, a failure is plausible, or the risk
justifies independent confirmation. Do not routinely rerun the worker's complete
test suite or repeat visual QA that has adequate artifacts. Default reviewer
subagents would also route to Flash, so do not mistake a default child for an
independent Astra review.

Accept only after both lenses and relevant verification succeed. If corrections
are needed, return all precise file-level findings to the same worker in one request.
Default to at most one correction cycle, then accept or explicitly reassess the
scope and risk. A second cycle is reserved for a material unresolved issue in the
high-assurance exception below. Never silently switch model/provider.

## 7. Integrate, checkpoint, and finish

Astra integrates accepted dependencies in order, with the user's existing Git
permissions. Do not auto-commit, merge branches, push, deploy, or apply production
migrations just because a phase finished. Shared-workspace edits already exist in
the workspace; don't invent a branch merge. Separate-worktree integration needs
an explicit, reviewed operation and a valid common baseline.

Run cross-task checks once at a genuine integration boundary, and only when those
checks add coverage beyond the worker's accepted evidence. Update the plan and a
compact `CHECKPOINT.md` at meaningful resumable boundaries, not after every turn:
completed/accepted work, current diff/workspace, contract decisions, pending tasks,
worker thread IDs, review status, exact resume action. Preserve evidence before
context compaction. Do not repeatedly reload full logs.

Conclude with what was built, what actually passed, outstanding limits, and the
verified or unverified routing state. Never estimate cost savings from task counts
or durations. Use actual provider usage records when measuring costs.

## High-assurance exception

Expand Astra's investigation, checks, or correction cycle only when evidence shows
material risk involving architecture, authentication/authorization, payments,
tenancy, secrets, destructive migrations, production behavior, or high-impact
shared infrastructure. State the reason for expanding the root loop. High assurance
does not justify progress polling, duplicate implementation, or ritual reruns.


## Templates (bundled verbatim)

### task-brief.md

# <Task ID>: <Reviewable deliverable>

## Assignment
Executor: astra_flash_builder
Phase: <phase ID>
Workspace: <exact path verified by Astra>
Baseline: <branch/commit plus pre-existing changes, or explicit non-Git snapshot>
Dependencies: <accepted task IDs and the concrete outputs present here>
Report/checkpoint path: <unique task-owned path>

## Goal and non-goals
<Entire coherent bundle, not one microscopic step.>

## Done when
- <Observable behavior and its acceptance ID.>
- <Negative or boundary behavior.>
- <Specified verification evidence.>

## Context and exact contracts
<Only relevant repo patterns, types, error cases and interface signatures.>

## Files and ownership
May change: <literal files/directories, including this task's tests/report.>
Must not change: <other worker scopes and unrelated user work.>
Default exclusions: secrets/.env files, production config, undeclared dependencies
or lockfiles, CI, unrelated migrations, router/Codex configuration, and .git internals.
Explicit exceptions: <none, or the exact user-authorized exception.>

## Implementation freedom
<Important internal decisions left to the worker. Do not prewrite every function.>

## Verification
Working directory: <path>
Commands and expected results:
- `<actual command>` -> <expected result>
Required test cases: <precise happy, negative and boundary cases.>
UI/runtime checks: <observable states or why not applicable.>

## Budget, checkpoint and stop rules
<Run budget and meaningful milestones appropriate for this task; no invented universal duration.>
Continue the in-scope test/code/fix loop autonomously. Report missing contracts,
unsafe conflicts, unavailable environment or repeated failures instead of inventing
requirements. No nested agents/CLIs, no permission bypass, no commits/merges/deploys.

## Required return
Use task-report.md. Include actual commands/exits, changed files, unresolved risks
and the resume checkpoint. STATUS is ready_for_review, blocked, or failed; only
Astra can accept the task.


### task-report.md

# <Task ID> implementation report
STATUS: <ready_for_review | blocked | failed>
Workspace/baseline: <actual path and baseline>
Thread ID: <host-observed ID, if available>

## Changes
<Changed paths and behavior; separate pre-existing changes.>

## Verification evidence
<Each actual command, working directory, exit code, result and log location.>

## Remaining risks or decisions
<Missing checks, limitations, blockers; never claim acceptance.>

## Resume checkpoint
<Completed internal steps, unfinished work, last failure, exact next action.>

---
# Astra-only review record
Spec compliance: <pass | changes requested | blocked, with evidence>
Code quality/security: <pass | changes requested | blocked, with evidence>
Independent verification: <actual commands or visual/runtime checks>
Routing evidence: <host/router metadata, not a worker self-identification>
Decision: <accepted | changes requested | blocked>
Correction cycles: <count>
Integration status: <what is present in the dependent workspace>


> Vendored verbatim from ethanplusai/astra-flash-orchestrator for a like-for-like baseline. Routing here is agent-farm's provider (OpenRouter) for both root and child, not Codex Router; doctor.py/routing.json checks do not apply, treat routing as verified by the launcher.
