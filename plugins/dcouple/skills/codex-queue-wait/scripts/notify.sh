#!/bin/bash
# notify.sh <receipts-dir> <expected-count> <codex-thread> [message] [parent-profile]
# With a 5th arg the parent is an exec-mode session and is RESUMED (codex exec resume in its own runtime);
# without it, the parent is a live interactive thread and a message is QUEUED.
# Filesystem waiter: no model in the loop. When <expected-count> receipts exist, wake the parent ONCE.
# TIMEOUT_MIN (default 180) sends a timeout message instead.
set -u
DIR="$1"; N="$2"; THREAD="$3"; MSG="${4:-All $N lanes have written receipts under $DIR. Check them once and continue.}"
PROFILE="${5:-}"
DEADLINE=$(( $(date +%s) + ${TIMEOUT_MIN:-180}*60 ))
TIMED_OUT=0
# On timeout the parent is woken through the SAME path as on completion (pinned model, right runtime, right cwd).
# Measured 2026-09-21: the old timeout branch read $PROFILE before it was assigned, so every exec-mode parent
# whose lane overran TIMEOUT_MIN got a `codex queue` call that fails with "no rollout found" and was never woken.
until [ "$(ls "$DIR"/*/meta.json 2>/dev/null | wc -l | tr -d ' ')" -ge "$N" ]; do
  if [ "$(date +%s)" -ge "$DEADLINE" ]; then
    MSG="Waiter timed out after ${TIMEOUT_MIN:-180} min: $(ls "$DIR"/*/meta.json 2>/dev/null | wc -l | tr -d ' ') of $N receipts under $DIR. Decide once: reconcile what exists, wait again with a longer budget, or stop."
    TIMED_OUT=1; break
  fi
  sleep 15
done
if [ -n "$PROFILE" ]; then
  # exec-mode parent: the process ended with its turn; resume the same thread with the message.
  #
  # PIN THE MODEL. agent-farm passes --model on the launch command line, not in the runtime config, so a
  # bare `codex exec resume` silently falls back to ~/.codex/config.toml's default. Measured 2026-09-20:
  # every resumed turn ran as `gpt-daybreak-blue-latest` instead of gpt-6-astra, and codex said so in an
  # item_0 error nobody read ("recorded with model X but is resuming with Y"). The model and effort are
  # read back from the profile's own agent file and passed explicitly.
  AGENT_MD="${AGENT_FARM_CONFIG_ROOT:-$HOME/.config/agent-farm}/agents/$PROFILE.md"
  MODEL=$(awk '/^model:/{f=1;next} f&&/^  name:/{print $2;exit} f&&/^[^ ]/{exit}' "$AGENT_MD" 2>/dev/null)
  EFFORT=$(awk '/^model:/{f=1;next} f&&/^  reasoning:/{print $2;exit} f&&/^[^ ]/{exit}' "$AGENT_MD" 2>/dev/null)
  [ -z "$MODEL" ] && { echo "notify.sh: cannot resolve model for profile $PROFILE from $AGENT_MD; refusing to resume on the config default" >&2; exit 3; }
  MODEL_ARGS=(-c "model=\"$MODEL\"")
  [ -n "$EFFORT" ] && MODEL_ARGS+=(-c "model_reasoning_effort=\"$EFFORT\"")
  # agent-farm keys its private CODEX_HOME on the launch directory, so a resume from any other cwd looks in
  # the wrong home ("no rollout found"). Locate the parent's runtime by its thread id and resume there,
  # from the parent's own cwd; fall back to agent-farm's resume only if the rollout cannot be found.
  ROLL=$(grep -l "\"id\":\"$THREAD\"" "$HOME"/.cache/agent-farm/native-proof/*/sessions/*/*/*/*.jsonl 2>/dev/null | head -1)
  if [ -n "$ROLL" ]; then
    RT="${ROLL%%/sessions/*}"; PCWD=$(head -c 2000 "$ROLL" | python3 -c 'import sys,json,re; m=re.search(r"\"cwd\":\"([^\"]+)\"",sys.stdin.read()); print(m.group(1) if m else ".")')
    ( cd "$PCWD" && CODEX_HOME="$RT" codex exec resume "$THREAD" "${MODEL_ARGS[@]}" --yolo --skip-git-repo-check --json "$MSG" < /dev/null ) > "$DIR/parent-resume.json" 2> "$DIR/parent-resume.err"
  else
    agent-farm run "$PROFILE" --exec --message "$MSG" -- exec resume "$THREAD" "${MODEL_ARGS[@]}" > "$DIR/parent-resume.json" 2> "$DIR/parent-resume.err"
  fi
  # A resumed turn that still reports a model mismatch is not the profile's model: say so loudly.
  if head -c 4000 "$DIR/parent-resume.json" 2>/dev/null | grep -q "is resuming with"; then
    echo "notify.sh: WRONG MODEL on resume of $THREAD (expected $MODEL); see $DIR/parent-resume.json item_0" >&2
  fi
else
  codex queue --thread "$THREAD" --message "$MSG"
fi
[ "$TIMED_OUT" = 1 ] && exit 2
exit 0
