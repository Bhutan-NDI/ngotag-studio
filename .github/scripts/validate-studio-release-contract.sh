#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <release-contract>" >&2
  exit 2
fi

contract=$1

test -f "$contract" || {
  echo "Studio release contract does not exist: $contract" >&2
  exit 1
}

jq -e '
  .schema_version == 1 and
  (.environments | type == "object") and
  (.environments | keys == ["prod", "qa", "stage"]) and
  ([.environments | to_entries[] | select(
    (.value.allowed_branch | type) != "string" or
    (.value.allowed_branch | test("^(develop|main)$") | not) or
    (.value.tag_prefix | type) != "string" or
    .value.tag_prefix != ("studio-" + .key + "-")
  )] | length == 0) and
  (.ci.check_name | type == "string" and length > 0) and
  (.ci.app_slug | type == "string" and length > 0)
' "$contract" >/dev/null || {
  echo "Studio release contract failed validation: $contract" >&2
  exit 1
}
