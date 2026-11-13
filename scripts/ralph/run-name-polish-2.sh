#!/bin/bash
# One command for the second polish Ralph run, code only (the 117 P3 items). Safe to re-run: it resumes where it stopped.
#   ./scripts/ralph/run-name-polish-2.sh            # 100 iterations
#   ./scripts/ralph/run-name-polish-2.sh 40         # another number of iterations
# Installs prd-name-polish-2.json as prd.json when prd.json is missing, belongs to another run,
# or is an older version of this run (runVersion differs; the old one is archived and
# progress.txt is kept). Then marks every batch whose items are already done or dropped
# in backlog.md as passed, so finished work is never redone.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEW="$DIR/prd-name-polish-2.json"
BACKLOG="$DIR/qa/name-polish-2/backlog.md"
NEW_BRANCH=$(jq -r '.branchName' "$NEW")
NEW_VERSION=$(jq -r '.runVersion // ""' "$NEW")
ITERATIONS="${1:-100}"

CURRENT_BRANCH=""
CURRENT_VERSION=""
if [ -f "$DIR/prd.json" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // ""' "$DIR/prd.json" 2>/dev/null || echo "")
  CURRENT_VERSION=$(jq -r '.runVersion // ""' "$DIR/prd.json" 2>/dev/null || echo "")
fi

if [ "$CURRENT_BRANCH" != "$NEW_BRANCH" ] || [ "$CURRENT_VERSION" != "$NEW_VERSION" ]; then
  if [ -f "$DIR/prd.json" ]; then
    DEST="$DIR/archive/$(date +%Y-%m-%d-%H%M)-${CURRENT_BRANCH#ralph/}${CURRENT_VERSION:+-$CURRENT_VERSION}"
    [ -z "$CURRENT_BRANCH" ] && DEST="$DIR/archive/$(date +%Y-%m-%d-%H%M)-previous"
    mkdir -p "$DEST"
    cp "$DIR/prd.json" "$DEST/"
    [ -f "$DIR/progress.txt" ] && cp "$DIR/progress.txt" "$DEST/"
    echo "Archived the previous prd.json (${CURRENT_BRANCH:-unknown} ${CURRENT_VERSION}) to $DEST"
  fi
  cp "$NEW" "$DIR/prd.json"
  if [ "$CURRENT_BRANCH" = "$NEW_BRANCH" ] && [ -f "$DIR/progress.txt" ]; then
    printf '\n---\nSwitched to the code-only stories (%s) on %s: no QA or verification, see tasks/prd-name-polish-2.md\n---\n' "$NEW_VERSION" "$(date)" >> "$DIR/progress.txt"
  else
    printf '# Ralph Progress Log\nStarted: %s\nRun: name swiper second polish, code only (tasks/prd-name-polish-2.md)\n---\n' "$(date)" > "$DIR/progress.txt"
  fi
  echo "$NEW_BRANCH" > "$DIR/.last-branch"
  echo "Installed $(jq '.userStories | length' "$DIR/prd.json") stories for $NEW_BRANCH ($NEW_VERSION)."
fi

# Batches whose items are all done or dropped in the backlog are already finished.
DONE_IDS=$(grep -E '^\| NP-' "$BACKLOG" | awk -F'|' '{gsub(/ /,"",$2); s=$13; gsub(/^ +| +$/,"",s); if (s ~ /^(done|dropped)/) print $2}' | jq -R . | jq -s .)
TMP=$(mktemp)
jq --argjson done "$DONE_IDS" '
  .userStories |= map(if (.items // []) != [] and (.passes != true) and ((.items - $done) == [])
                      then .passes = true | .notes = "already done before the code-only switch" else . end)' "$DIR/prd.json" > "$TMP" && mv "$TMP" "$DIR/prd.json"

echo "Resuming $NEW_BRANCH: $(jq '[.userStories[] | select(.passes != true)] | length' "$DIR/prd.json") stories left."
exec "$DIR/ralph.sh" --tool claude "$ITERATIONS"
