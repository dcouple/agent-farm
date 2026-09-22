---
name: audits
description: >-
  Audit stale GitHub issues and stale agent-facing docs (AGENTS.md, CLAUDE.md,
  skill blocks, CLI contract copies) against the default branch. Use when the
  user asks to close stale issues, sweep the backlog, check whether AGENTS.md
  or docs are outdated, or run repo hygiene on issues and documentation.
argument-hint: "[issues|docs|both] [optional owner/repo]"
---

# Audits

Compare open issues and agent-facing docs to what actually shipped. Report
first. Close issues or edit docs only after the user approves the list.

Default to **both** surfaces unless the user or launch argument names one.
Audit the **default branch** (`origin/main` unless the repo uses another),
not a leftover feature worktree.

## Rules

- Idle age is a filter, not proof. A 200-day issue can still be real work.
- Prove shipped work from `origin/main` (or the default branch): file contents,
  tests, generated CLI contracts, merged PRs that actually implement the ask.
- `gh search` on a bare issue number is noisy. A hit on `#220` is not a close.
- Do not close an issue that has a matching **open** PR.
- Partial ships: close only if the headline landed, and say what did not.
  Otherwise keep it and name the leftover.
- Duplicates: keep the earlier or richer ticket; close the other with a pointer.
- Superseded: a later design replaced the proposed API. Close the old ticket
  even if its code never merged.
- Do not patch docs on a branch that is hundreds of commits behind default.
  Switch evidence to the default branch and say so.
- Never close, comment, or edit until the user picks the list.

## 1. Issues

1. List open issues (`gh issue list --state open --limit 200 --json ...`).
   Note age, idle time, labels, and titles.
2. Pull likely-done candidates: titles that match shipped features, canaries
   that say "safe to close after verification", CI/tooling migrations whose
   deadline has passed, refactors of code that no longer exists.
3. For each candidate, prove or disprove on the default branch:
   - `git grep` / `git show origin/main:path`
   - `git log origin/main -S 'unique string'`
   - merged PRs whose title/body actually match, not number-search
   - tests that use the issue's own fixture strings
4. Skip umbrellas with unshipped commands, bugs with live matching PRs, and
   "looks old" feature requests with no landing evidence.

### Close buckets

| Bucket | Close when |
|---|---|
| Shipped | The asked behavior is on the default branch |
| Duplicate | Same ask as an earlier open issue |
| Superseded | A later design covers the job; this API/approach is abandoned |
| Canary | The verification path already succeeded in later filings |

### Report, then close

Lead with a **Close** table (issue, why, landing PR/path). Optional second
table for duplicates/superseded. A short **do not close** list for lookalikes.

After approval, close with a comment that names the landing evidence. Mention
leftovers (follow-up issue or "reopen if you still want X"). Use `gh issue
close N --comment`.

## 2. Agent docs

Target files that agents actually follow:

- `AGENTS.md`, `CLAUDE.md`, nested `CLAUDE.md`
- Managed `pane-agent-context` / similar injected blocks
- Generated CLI contracts and package READMEs that copy command lists
- Architecture/state docs that still teach old APIs (`docs/*.md`)

For each claim that would change an agent's next command or data model:

1. Quote the claim (file + section).
2. Check the default branch: command exists, flags match, types/stores still
   exist, architecture boxes still exist (no Express server that is gone, no
   store setter after the store moved).
3. Classify: **wrong** (will make the agent do the wrong thing), **stale
   identity** (one-agent-brand copy, old product name), **generated-current**
   (leave it), **worktree-only** (this branch is behind; ignore).

Highest-value misses: command lists that omit the current primitive, Node or
toolchain floors that drifted, examples that hardcode one agent brand, docs
that teach deleted components.

Do not hand-edit generated contract files. Edit the source, then regenerate.

If agent context is generated from a contract (for example Pane's
`contracts/runpane/contract.json` `agentContext.managedBlock` and
`agentContext.brief.rules`), change those strings, regenerate, then sync the
committed `AGENTS.md` block. `agent-context --json` is what agents actually
read; fixing only `AGENTS.md` will be overwritten.

### Report, then edit

Same shape as issues: a **Fix** table (file, claim, what is true now, suggested
edit). Ask before changing files. Keep edits to the lying sentence; do not
rewrite the whole doc.

## Anti-patterns

- Closing because overlapping work landed nearby (a skill workaround is not the
  daemon fix).
- Treating one command as obsolete just because a newer one exists; they can
  both be valid if the doc says when to use which.
- Auditing a stale worktree and "fixing" its `AGENTS.md` instead of default.
- Filing new issues for every stale paragraph; prefer editing the doc.
- Posting close comments that read like a changelog dump. One or two sentences
  plus links is enough.
