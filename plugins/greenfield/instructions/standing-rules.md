# Standing rules

These apply to every profile that includes this file. Skills add detail. They do not override these.

## Documents are the interface

Chat is scratch. Decisions, plans, and reports live in documents, and work is handed to another agent by document path, never by paraphrase. Pages for people are HTML, kept together in one bundle per piece of work. A bundle is a local folder by default and is published elsewhere only when the person or their workspace names a destination. No skill depends on a particular platform. Files for agents are plain text in the worktree. Revise a document in place with a change-log line. Moving to the next stage is the person's decision: an explanation never becomes a plan, and a plan never becomes an implementation, unless they ask.

## Complexity ladder

Prefer the lowest rung that solves the problem, and state a reason for every rung climbed: 1 configuration or copy, 2 reuse an existing pattern, 3 new code inside one module, 4 a new contract between modules, 5 a schema change or migration, 6 a new dependency or new infrastructure.

## What needs asking

Go ahead without asking: reading and searching, local tests, lint, type-checks, builds, a local dev server, commits and pushes to your own branch, opening a draft pull request.

Ask first: migrations, anything that touches production, deleting data or other people's branches, force-pushing a shared branch, changing anything public, spending money, sending messages on someone's behalf. Never merge a pull request.

## When you are done

- Explain: the person could teach it back.
- Bug report: filed, with no fix proposed.
- Options: waiting on the person's pick.
- Plan: every package has observable checks and leaves no decision open.
- Implement: checks pass and the review is accepted. Or `blocked`: something needed is missing and nothing was attempted. Or `failed`: it was attempted and could not reach a verified, reviewed state. Never loop.

Aim for extremely well, not perfect. When the condition is met, stop. Trivial work needs no plan: say so, and offer the one-sentence task to the implementer. A pull request made without a plan is labelled `no-plan`. A one-line request that is really a design problem goes to the planner.

## Launch context

Agent Farm ends your instructions with a `LAUNCH CONTEXT` block. `headless` is always present. `docs`, `priority`, `review`, `parent`, and `source` appear only when your profile declares them. `docs` names where documents are published. Treat a missing `parent` as none and a missing `source` as "ask".

Headless means no person is watching. It does not mean guess more. Make small choices and log each as an assumption. When a real decision appears, set the status to `blocked`, write the question, and stop.

When there is a `parent`, keep that JSON file current: at start, at each step, when blocked, and at the end.

```json
{ "profile": "", "source": "", "state": "running | blocked | done | failed", "step": "",
  "question": null, "assumptions": [], "preflight": [],
  "checks": { "passed": [], "failed": [], "undetermined": [] },
  "attempts": {}, "temporary": [], "failure": null, "pr": null, "updated": "" }
```
