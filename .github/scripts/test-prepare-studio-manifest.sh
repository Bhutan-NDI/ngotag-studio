#!/bin/sh

set -eu

# Exercises prepare-studio-manifest.sh against a stub `gh` that serves a manifest
# and, when the prepare workflow is dispatched, advances it to the next manifest.

script="$(pwd)/.github/scripts/prepare-studio-manifest.sh"
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT HUP INT TERM
mkdir "$work/bin"

cat > "$work/bin/gh" <<'EOF'
#!/bin/sh
case "$1 $2" in
  "api repos/"*)
    test -f "$STUB_DIR/current.json" || exit 1
    base64 < "$STUB_DIR/current.json"
    ;;
  "workflow run")
    echo "$*" >> "$STUB_DIR/dispatched"
    if [ -f "$STUB_DIR/next.json" ]; then
      cp "$STUB_DIR/next.json" "$STUB_DIR/current.json"
    fi
    ;;
  *)
    echo "unexpected gh call: $*" >&2
    exit 1
    ;;
esac
EOF
chmod +x "$work/bin/gh"

manifest() {
  jq -n --argjson enabled "$1" --arg state "$2" --arg version "$3" --arg commit "$4" \
    '{enabled: $enabled, release: {state: $state, version: $version, deployed: {commit: $commit}}}'
}

source_sha=1111111111111111111111111111111111111111
other_sha=2222222222222222222222222222222222222222

# run <expected-exit> <expected-dispatches> <description> [VAR=value...]
run() {
  expected_status=$1
  expected_dispatches=$2
  description=$3
  shift 3
  rm -f "$work/dispatched"
  set +e
  env PATH="$work/bin:$PATH" STUB_DIR="$work" PREPARE_WAIT_SECONDS=0 PREPARE_MAX_ATTEMPTS=3 "$@" \
    sh "$script" example/manifests qa "$source_sha" prepare.yml > "$work/output" 2>&1
  status=$?
  set -e
  dispatches=0
  if [ -f "$work/dispatched" ]; then
    dispatches=$(wc -l < "$work/dispatched" | tr -d ' ')
  fi
  if [ "$status" -ne "$expected_status" ] || [ "$dispatches" -ne "$expected_dispatches" ]; then
    echo "$description: expected exit $expected_status with $expected_dispatches dispatch(es), found exit $status with $dispatches" >&2
    cat "$work/output" >&2
    exit 1
  fi
  rm -f "$work/current.json" "$work/next.json"
}

manifest true pending 0.1.3 "$other_sha" > "$work/current.json"
run 0 0 "already pending manifest is used without dispatch"

manifest false deployed 0.1.2 "$other_sha" > "$work/current.json"
run 1 0 "disabled environment fails before dispatch"

manifest true deployed 0.1.2 "$source_sha" > "$work/current.json"
run 1 0 "same deployed source fails before dispatch"

manifest true deployed 0.1.2 "$source_sha" > "$work/current.json"
manifest true pending 0.1.3 "$source_sha" > "$work/next.json"
run 0 1 "same deployed source is prepared when explicitly requested" RELEASE_SAME_SOURCE=true

manifest true deployed 0.1.2 "$other_sha" > "$work/current.json"
manifest true pending 0.1.3 "$other_sha" > "$work/next.json"
run 0 1 "new source dispatches the prepare workflow and waits for pending"
grep -q "workflow run prepare.yml --repo example/manifests --ref main -f environment=qa" "$work/dispatched"

manifest true deployed 0.1.2 "$other_sha" > "$work/current.json"
run 1 1 "prepare that never reaches pending times out"

run 1 0 "unreadable manifest fails before dispatch"

echo "prepare-studio-manifest tests passed"
