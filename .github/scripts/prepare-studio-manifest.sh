#!/bin/sh

set -eu

# Ensures the environment's private release manifest is pending before Make tags a
# release. A deployed manifest is advanced by the manifest repository's own
# prepare workflow, so the version bump stays reviewed, signed, and recorded there.

if [ "$#" -ne 4 ]; then
  echo "usage: $0 <config-repository> <environment> <source-sha> <prepare-workflow>" >&2
  exit 2
fi

config_repository=$1
environment=$2
source_sha=$3
prepare_workflow=$4
manifest_path="studio/environments/${environment}.json"
release_same_source=${RELEASE_SAME_SOURCE:-false}
max_attempts=${PREPARE_MAX_ATTEMPTS:-60}
wait_seconds=${PREPARE_WAIT_SECONDS:-5}
# Transient GitHub API errors are retried; persistent ones fail after this many
# consecutive failed reads.
max_api_failures=6
api_failures=0

# Prints "<enabled>|<state>|<version>|<deployed-commit>" for the manifest on main,
# or nothing when it cannot be read.
read_release() {
  gh api "repos/${config_repository}/contents/${manifest_path}?ref=main" --jq '.content' \
    | base64 --decode \
    | jq -r '[(.enabled == true), (.release.state // ""), (.release.version // ""),
        (.release.deployed.commit // "")] | map(tostring) | join("|")'
}

parse_release() {
  IFS='|' read -r enabled state version deployed_commit <<EOF
$1
EOF
}

release=$(read_release 2>/dev/null) || release=""
test -n "$release" || {
  echo "could not read the $environment release manifest from $config_repository" >&2
  exit 1
}
parse_release "$release"

if [ "$enabled" != "true" ]; then
  echo "$environment is disabled in the release manifest; enable it in a reviewed manifest change before releasing" >&2
  exit 1
fi

if [ "$state" = "pending" ]; then
  echo "Using pending $environment release $version"
  exit 0
fi

if [ "$deployed_commit" = "$source_sha" ] && [ "$release_same_source" != "true" ]; then
  echo "$environment release $version is already deployed from $source_sha; nothing new to release" >&2
  echo "set RELEASE_SAME_SOURCE=true to rebuild and redeploy the same source as a new version" >&2
  exit 1
fi

echo "Preparing a new $environment release after $version"
gh workflow run "$prepare_workflow" --repo "$config_repository" --ref main \
  -f "environment=$environment" >/dev/null

attempt=1
while [ "$attempt" -le "$max_attempts" ]; do
  sleep "$wait_seconds"
  if release=$(read_release 2>/dev/null) && [ -n "$release" ]; then
    api_failures=0
    parse_release "$release"
    if [ "$state" = "pending" ]; then
      echo "Prepared pending $environment release $version"
      exit 0
    fi
  else
    api_failures=$((api_failures + 1))
    if [ "$api_failures" -ge "$max_api_failures" ]; then
      echo "GitHub API failed $api_failures consecutive times while reading the $environment release manifest" >&2
      exit 1
    fi
    echo "warning: could not read the $environment release manifest; retrying ($api_failures/$max_api_failures)" >&2
  fi
  attempt=$((attempt + 1))
done

echo "timed out waiting for the $environment release manifest to become pending; check the manifest repository's prepare workflow run" >&2
exit 1
