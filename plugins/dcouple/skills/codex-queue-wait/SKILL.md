---
name: codex-queue-wait
description: Launch long-running work, END YOUR TURN, and be woken once by `codex queue` when it finishes. Replaces polling, sleep loops, `wait` calls and empty `write_stdin` yields, which were measured at 86% to 98% of an orchestrator parent's cost.
---

# codex-queue-wait: stop paying to wait

You are billed for every turn you spend checking whether something has finished. In this study's own
session logs the meta-orchestrator parent spent 86% to 98% of its cost on `write_stdin("", yield)` polls
of its child, and a native-`wait` orchestrator 16% on `wait` calls. A public comparison found 41 wake-ups
costing $1.20 where one native wait cost $0.04. The fix is built into codex ≥ 0.155: `codex queue` puts a
message into an existing thread, and the thread resumes when it arrives.

## The pattern, in order

1. **Find your own thread id, once, at the start.** Your rollout is the newest session file whose `cwd`
   is your working directory:
   ```bash
   codex_self_thread() { for f in $(ls -t ${CODEX_HOME:-$HOME/.codex}/sessions/$(date +%Y/%m/%d)/*.jsonl $HOME/.cache/agent-farm/native-proof/*/sessions/$(date +%Y/%m/%d)/*.jsonl 2>/dev/null); do
     python3 - "$f" "$PWD" <<'PY'
   import json,sys; m=json.loads(open(sys.argv[1]).readline())["payload"]
   if m.get("cwd")==sys.argv[2]: print(m["session_id"]); raise SystemExit(0)
   raise SystemExit(1)
   PY
     [ $? -eq 0 ] && return; done; }
   THREAD=$(codex_self_thread)
   ```
   If that yields nothing, ask the launcher for it; never guess. The waiter inherits your environment, so
   `CODEX_HOME` (if set) reaches `codex queue` unchanged.
2. **Launch the work as detached processes**, one per lane, each wrapped so a receipt appears when it
   finishes. Never launch it in your own foreground:
   ```bash
   R=<receipts-dir>; mkdir -p $R/lane1
   nohup bash -c 'agent-farm run <builder-profile> --exec < brief-lane1.md > '"$R"'/lane1/raw.json 2> '"$R"'/lane1/err.log; printf "{\"exit\":%d}" $? > '"$R"'/lane1/meta.json' >/dev/null 2>&1 &
   ```
3. **Start the waiter, detached.** Two modes, and you must pick the right one:
   - Interactive session (`codex` TUI or app-server): the thread stays alive, so the waiter queues a
     message: `nohup scripts/notify.sh <receipts-dir> <count> "$THREAD" >/dev/null 2>&1 &`
   - **Non-interactive (`codex exec`, which is how `agent-farm run --exec` runs you): ending your turn
     ends the process, and a queued message wakes nothing.** The waiter must resume the session instead;
     pass your own profile name as the 5th argument and it will run
     `agent-farm run <profile> --exec --message "<msg>" -- exec resume "$THREAD"`:
     `nohup scripts/notify.sh <receipts-dir> <count> "$THREAD" "" <your-profile> >/dev/null 2>&1 &`
     Your resumed turn's output is written to `<receipts-dir>/parent-resume.json`.
   Either way the waiter loops on the filesystem, not on you, and wakes you exactly once.
4. **Say what is running and where results will land, then END YOUR TURN.** Literally stop responding.
   Do not sleep, do not `wait`, do not re-read the receipts directory, do not write an empty string to a
   child's stdin. If no waiter is possible, say: "I'm stopping here; wake me when the lanes finish" and
   end the turn anyway.
5. **On resume, check once.** Read the receipts. If complete, verify and continue. If something is still
   running, report that and end the turn again.

## Rules

- One message per completion event. The waiter queues exactly one message; do not ask it for progress.
- Respect timeouts: give the waiter a deadline (`TIMEOUT_MIN`, default 180); on expiry it queues a
  "timed out" message and you decide, once.
- Children get self-contained packets, never your thread. The waiter wakes you; it does not carry
  context.
- This skill does the waiting. Your job on resume is judgement: reconcile, verify, accept or reject.
