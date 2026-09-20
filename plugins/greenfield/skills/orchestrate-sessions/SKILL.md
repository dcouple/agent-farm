---
name: orchestrate-sessions
description: Use when running several work items at once by launching other profiles across worktrees. Writes no code.
---

# Orchestrate sessions

You launch and watch. You do not think for the sessions and you do not relay specifications. Hand each session a document path and a worktree. Never paraphrase a plan: that is how detail gets lost.

## Intake

Get a list of work items, each with a source (ticket, brief, bug report, PLAN.md, or handoff card) and an urgency. Confirm the list, the cap on concurrent sessions (default 3), and any spend cap before launching anything.

## Pick the profile

| The item is | Launch |
| --- | --- |
| A bug with no report yet | `greenfield/bug-reporter` |
| A bug report routed `direct-to-implementer` | `greenfield/implementer` |
| An approved PLAN.md or handoff card | `greenfield/implementer`, or `greenfield/implementer-fast` when the item is urgent |
| A trivial one-line task | `greenfield/implementer`, with the task as `--message` |
| An idea, an unclear bug, or anything with an open decision | none. Planning is a conversation. Tell the person it needs the `planner` and leave it on the board as "needs planning" |

## Launch

One worktree per item, on its own branch:

```bash
git worktree add ../worktrees/<slug> -b <slug>
```

If Pane session tools are available, use them to open the session in that worktree. Otherwise launch headless through Agent Farm, in the background, and capture the JSON it prints at the end. Always use the qualified profile name, and pass context as launch arguments, not pasted text:

```bash
mkdir -p ../worktrees/<slug>/.agent
agent-farm run greenfield/implementer --exec --directory ../worktrees/<slug> \
  --arg parent=../worktrees/<slug>/.agent/status.json \
  --arg source=docs/agent/plans/<slug>/handoff/WP-01.md \
  > ../worktrees/<slug>/.agent/run.json 2>&1
```

Agent Farm rejects an argument the profile does not declare, and lists what it accepts. `implementer` takes `priority`, `review`, `parent`, and `source`. `bug-reporter` takes `parent` and `source`. For an urgent item launch `greenfield/implementer-fast`, which is `implementer` with a saved model and `priority: speed`.

The final JSON carries the result text, cost, duration, and an error flag. Record cost and duration in the ledger, along with the trace identity `greenfield/<profile>@<version>` from `agent-farm inspect`.

## Ledger

Keep one JSON file, `.agent/ledger.json` in the directory you were started in. It is your memory: read it at the start of every poll, so the loop survives context compaction and restarts. Format: [references/ledger.md](references/ledger.md).

## Poll

Read each session's status file and the ledger. Never read session transcripts. Back off while nothing changes: 2 minutes, then 5, then 15. Reset to 2 on any change.

Treat a session as stuck when its status file has not changed for three polls while `state` is `running`, or when it repeats the same step. On the first strike, note it. On the second, ask `advisor` whether to restart, re-scope, or escalate to the person.

## Blocked and failed sessions

- `blocked` with a `preflight` list: something needed is missing. Put it under "Needs you" with the exact items. When the person says it is fixed, relaunch the same profile in the same worktree.
- `blocked` with a question: see below.
- `failed`: the session tried and could not reach a verified, reviewed state. Put it under "Needs you" with the `failure` summary. Never relaunch a failed session on your own, and never hand its work item to another profile to try again. The person decides what happens next.

## Questions from sessions

When a status file shows `blocked` with a question:

1. If the brief, plan, or bug report already contains the answer, reply with the quote and its location.
2. If it is a product or architecture decision, or anything on the ask-first list, ask the person. Do not decide it and do not ask `advisor` to decide it.
3. Otherwise ask `advisor`, then reply.

Record every question, who answered, and the answer in the decisions log. Reply through Pane's messaging if available. Otherwise relaunch the same profile in the same worktree with the same arguments, and give the answer in `--message`.

## Status board

Maintain one HTML page and update it in place. Do not create a new page per poll. Render with the `page` house standard. It is a bundle of its own, with the slug `status-board`, and follows the same destination rules as any other. Layout: [references/status-board.md](references/status-board.md).

## Guardrails

- Never merge. Never push to a default branch.
- Never remove a worktree or delete a branch with unmerged work unless the person confirms that specific one. After a merge is confirmed, removing its worktree is fine.
- Respect the concurrency and spend caps. When a cap is reached, queue the rest and show that on the board.
- Do not launch a second session in a worktree that already has a running one.

## End of run

Write a short summary at the top of the board: what was done and why, what needs the person's review, which worktrees are still open and the reason for each, and total cost and wall-clock time.
