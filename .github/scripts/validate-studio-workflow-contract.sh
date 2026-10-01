#!/bin/sh

set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: $0 <release-contract> <deployment-workflow>" >&2
  exit 2
fi

contract=$1
workflow=$2

test -f "$contract" || {
  echo "Studio release contract does not exist: $contract" >&2
  exit 1
}
test -f "$workflow" || {
  echo "Studio deployment workflow does not exist: $workflow" >&2
  exit 1
}

# Parse the workflow as YAML so formatting changes cannot alter the comparison.
# mikefarah yq v4 is preinstalled on GitHub-hosted Ubuntu runners.
yq --version 2>/dev/null | grep -q 'mikefarah/yq.* v4\.' || {
  echo "mikefarah yq v4 is required to parse $workflow" >&2
  exit 1
}

expected=$(jq -r '.environments[].tag_prefix + "*"' "$contract" | LC_ALL=C sort)
trigger_globs=$(yq -e -r \
  '.on.push.tags | select(tag == "!!seq") | .[] | select(tag == "!!str")' \
  "$workflow") || {
  echo "on.push.tags in $workflow must be a list of tag globs" >&2
  exit 1
}
actual=$(printf '%s\n' "$trigger_globs" | LC_ALL=C sort)

if [ "$actual" != "$expected" ]; then
  echo "Studio deployment trigger globs do not match the release contract" >&2
  echo "Expected:" >&2
  printf '%s\n' "$expected" >&2
  echo "Found:" >&2
  printf '%s\n' "$actual" >&2
  exit 1
fi

mappings=$(jq -r \
  '.environments | to_entries[] | [.key, .value.tag_prefix] | @tsv' \
  "$contract")
expected_resolver_group='studio-release-resolver-${{ '
separator=
tab=$(printf '\t')

while IFS="$tab" read -r environment tag_prefix; do
  expected_resolver_group="${expected_resolver_group}${separator}startsWith(github.ref_name, '${tag_prefix}') && '${environment}'"
  separator=' || '
done <<EOF
$mappings
EOF

expected_resolver_group="${expected_resolver_group} || 'invalid' }}"
actual_resolver_group=$(yq -e -r \
  '.jobs.resolve.concurrency.group | select(tag == "!!str")' "$workflow") || {
  echo "jobs.resolve.concurrency.group in $workflow must be a string" >&2
  exit 1
}

if [ "$actual_resolver_group" != "$expected_resolver_group" ]; then
  echo "Studio resolver concurrency mapping does not match the release contract" >&2
  echo "Expected:" >&2
  printf '%s\n' "$expected_resolver_group" >&2
  echo "Found:" >&2
  printf '%s\n' "$actual_resolver_group" >&2
  exit 1
fi
