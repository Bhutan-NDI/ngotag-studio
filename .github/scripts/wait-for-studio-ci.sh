#!/bin/sh

set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <repository> <source-sha> <release-contract>" >&2
  exit 2
fi

repository=$1
source_sha=$2
contract=$3
state_filter=.github/scripts/select-studio-ci-state.jq
max_attempts=120
wait_seconds=5

test -f "$contract" || {
  echo "Studio release contract does not exist: $contract" >&2
  exit 1
}
test -f "$state_filter" || {
  echo "Studio CI state filter does not exist: $state_filter" >&2
  exit 1
}

check_name=$(jq -er '.ci.check_name // empty' "$contract")
app_slug=$(jq -er '.ci.app_slug // empty' "$contract")
attempt=1

while [ "$attempt" -le "$max_attempts" ]; do
  check_runs=$(gh api --paginate --slurp \
    "repos/${repository}/commits/${source_sha}/check-runs?per_page=100")
  state=$(printf '%s' "$check_runs" | jq -r \
    --arg check_name "$check_name" \
    --arg app_slug "$app_slug" \
    -f "$state_filter")

  case "$state" in
    success)
      exit 0
      ;;
    failed:*)
      echo "CI did not pass for $source_sha ($state)" >&2
      exit 1
      ;;
    missing|pending)
      ;;
    *)
      echo "unexpected CI state for $source_sha: $state" >&2
      exit 1
      ;;
  esac

  if [ "$attempt" -eq "$max_attempts" ]; then
    echo "timed out waiting for $check_name on $source_sha" >&2
    exit 1
  fi

  sleep "$wait_seconds"
  attempt=$((attempt + 1))
done
