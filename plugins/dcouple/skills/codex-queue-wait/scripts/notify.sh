#!/bin/bash
# notify.sh <receipts-dir> <expected-count> <codex-thread> [message] [parent-profile]
# With a 5th arg the parent is an exec-mode session and is RESUMED (agent-farm ... -- exec resume);
# without it, the parent is a live interactive thread and a message is QUEUED.
# Filesystem waiter: no model in the loop. When <expected-count> receipts exist, queue ONE message into
# the parent's codex thread so it resumes. TIMEOUT_MIN (default 180) queues a timeout message instead.
set -u
DIR="$1"; N="$2"; THREAD="$3"; MSG="${4:-All $N lanes have written receipts under $DIR. Check them once and continue.}"
DEADLINE=$(( $(date +%s) + ${TIMEOUT_MIN:-180}*60 ))
until [ "$(ls "$DIR"/*/meta.json 2>/dev/null | wc -l | tr -d ' ')" -ge "$N" ]; do
  [ "$(date +%s)" -ge "$DEADLINE" ] && { ${PROFILE:+agent-farm run "$PROFILE" --exec -- exec resume "$THREAD" --message} ${PROFILE:-codex queue --thread "$THREAD" --message} "Waiter timed out after ${TIMEOUT_MIN:-180} min: $(ls "$DIR"/*/meta.json 2>/dev/null | wc -l | tr -d ' ') of $N receipts under $DIR. Decide once: reconcile what exists or stop."; exit 2; }
  sleep 15
done
PROFILE="${5:-}"
if [ -n "$PROFILE" ]; then
  # exec-mode parent: the process ended with its turn; resume the same thread with the message.
  # agent-farm keys its private CODEX_HOME on the launch directory, so a resume from any other cwd looks in
  # the wrong home ("no rollout found"). Locate the parent's runtime by its thread id and resume there,
  # from the parent's own cwd; fall back to agent-farm's resume only if the rollout cannot be found.
  ROLL=$(grep -l "\"id\":\"$THREAD\"" "$HOME"/.cache/agent-farm/native-proof/*/sessions/*/*/*/*.jsonl 2>/dev/null | head -1)
  if [ -n "$ROLL" ]; then
    RT="${ROLL%%/sessions/*}"; PCWD=$(head -c 2000 "$ROLL" | python3 -c 'import sys,json,re; m=re.search(r"\"cwd\":\"([^\"]+)\"",sys.stdin.read()); print(m.group(1) if m else ".")')
    ( cd "$PCWD" && CODEX_HOME="$RT" codex exec resume "$THREAD" --yolo --skip-git-repo-check --json "$MSG" < /dev/null ) > "$DIR/parent-resume.json" 2> "$DIR/parent-resume.err"
  else
    agent-farm run "$PROFILE" --exec --message "$MSG" -- exec resume "$THREAD" > "$DIR/parent-resume.json" 2> "$DIR/parent-resume.err"
  fi
else
  codex queue --thread "$THREAD" --message "$MSG"
fi
