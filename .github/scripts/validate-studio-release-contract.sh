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
  (keys == ["ci", "environments", "schema_version"]) and
  (.environments | type == "object") and
  (.environments | length > 0) and
  ([.environments | keys[] | select(test("^[a-z0-9]+(-[a-z0-9]+)*$") | not)] | length == 0) and
  ([.environments | to_entries[] | select(
    (.value | type) != "object" or
    (.value | keys) != ["allowed_branch", "tag_prefix"] or
    (.value.allowed_branch | type) != "string" or
    (.value.allowed_branch | test("^(develop|main)$") | not) or
    (.value.tag_prefix | type) != "string" or
    .value.tag_prefix != ("studio-" + .key + "-")
  )] | length == 0) and
  (.ci | type == "object") and
  (.ci | keys == ["app_slug", "check_name"]) and
  (.ci.check_name | type == "string" and length > 0) and
  (.ci.app_slug | type == "string" and length > 0)
' "$contract" >/dev/null || {
  echo "Studio release contract failed validation: $contract" >&2
  exit 1
}
