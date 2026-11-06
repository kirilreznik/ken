#!/bin/bash
# One command for the name detail sheet Ralph run. Safe to re-run: it resumes where it stopped.
#   ./scripts/ralph/run-name-detail.sh            # 180 iterations
#   ./scripts/ralph/run-name-detail.sh 40         # another number of iterations
# First run only: archives the previous run's prd.json/progress.txt under archive/,
# installs prd-name-detail.json as prd.json, points CLAUDE.md's current run at this PRD
# and starts a fresh progress log.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEW="$DIR/prd-name-detail.json"
NEW_BRANCH=$(jq -r '.branchName' "$NEW")
ITERATIONS="${1:-180}"

CURRENT_BRANCH=""
[ -f "$DIR/prd.json" ] && CURRENT_BRANCH=$(jq -r '.branchName // ""' "$DIR/prd.json" 2>/dev/null || echo "")

if [ "$CURRENT_BRANCH" != "$NEW_BRANCH" ]; then
  if [ -f "$DIR/prd.json" ]; then
    DEST="$DIR/archive/$(date +%Y-%m-%d)-${CURRENT_BRANCH#ralph/}"
    [ -z "$CURRENT_BRANCH" ] && DEST="$DIR/archive/$(date +%Y-%m-%d)-previous"
    mkdir -p "$DEST"
    cp "$DIR/prd.json" "$DEST/"
    [ -f "$DIR/progress.txt" ] && cp "$DIR/progress.txt" "$DEST/"
    echo "Archived the previous run (${CURRENT_BRANCH:-unknown}) to $DEST"
  fi
  cp "$NEW" "$DIR/prd.json"
  printf '# Ralph Progress Log\nStarted: %s\nRun: name detail sheet (tasks/prd-name-detail.md)\n---\n' "$(date)" > "$DIR/progress.txt"
  echo "$NEW_BRANCH" > "$DIR/.last-branch"
  echo "Installed $(jq '.userStories | length' "$DIR/prd.json") stories for $NEW_BRANCH."
else
  echo "Resuming $NEW_BRANCH: $(jq '[.userStories[] | select(.passes != true)] | length' "$DIR/prd.json") stories left."
fi

exec "$DIR/ralph.sh" --tool claude "$ITERATIONS"
