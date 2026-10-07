#!/bin/sh

set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: $0 <environment> <allowed-branch> <manifest>" >&2
  exit 2
fi

environment=$1
expected_branch=$2
config=$3

test -f "$config" || {
  echo "Studio release manifest does not exist: $config" >&2
  exit 1
}

jq -e --arg environment "$environment" --arg expected_branch "$expected_branch" '
  .schema_version == 1 and
  .environment == $environment and
  .enabled == true and
  (.release.version | test("^[0-9]+\\.[0-9]+\\.[0-9]+$")) and
  .release.state == "pending" and
  (.deployment | type == "object") and
  ([.deployment[] | select(type != "string" or test("[\\r\\n]"))] | length == 0) and
  .deployment.allowed_branch == $expected_branch and
  (.deployment.aws_region | test("^[a-z]+-[a-z]+-[0-9]+$")) and
  (.deployment.cluster | length > 0) and
  (.deployment.service | length > 0) and
  (.deployment.task_definition_family | length > 0) and
  (.deployment.container_name | length > 0) and
  (.deployment.ecr_repository | length > 0) and
  ([.deployment | to_entries[] | select(
    (.value | type) == "string" and (.value | startswith("REVIEW_AND_SET_"))
  )] | length == 0) and
  (.build_args | type == "object") and
  .release.version == .build_args.NEXT_PUBLIC_CURRENT_RELEASE and
  ([
    "NEXT_PUBLIC_MODE", "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL", "NEXT_PUBLIC_PLATFORM_NAME",
    "NEXT_PUBLIC_ACTIVE_THEME", "NEXT_PUBLIC_APP_TITLE",
    "NEXT_PUBLIC_FOOTER_TEXT", "NEXT_PUBLIC_LOGO_BASE_URL",
    "NEXT_PUBLIC_CURRENT_RELEASE", "NEXT_PUBLIC_ENABLE_APP_LAUNCHER",
    "NEXT_PUBLIC_APP_NAME", "NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN",
    "NEXT_PUBLIC_ENABLE_BILLING_OPTION", "NEXT_PUBLIC_SOVIO_LANDINGPAGE_URL",
    "NEXT_PUBLIC_LANDINGPAGE_URL", "NEXT_PUBLIC_POLYGON_TESTNET_URL",
    "NEXT_PUBLIC_POLYGON_MAINNET_URL", "NEXT_PUBLIC_MARKETPLACE_MANAGE_URL",
    "NEXT_PUBLIC_MARKETPLACE_OFFER_URL", "NEXT_PUBLIC_MARKETPLACE_REQUIRED",
    "NEXT_PUBLIC_MARKETPLACE_PRODUCT_NAME", "NEXT_PUBLIC_MARKETPLACE_PUBLISHER_NAME",
    "NEXT_PUBLIC_MARKETPLACE_SUPPORT_EMAIL", "NEXT_PUBLIC_MARKETPLACE_PRIVACY_EMAIL",
    "NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID", "NEXT_PUBLIC_ETHEREUM_TESTNET_URL",
    "NEXT_PUBLIC_ETHEREUM_MAINNET_URL", "NEXT_PUBLIC_DOCS_URL"
  ] - (.build_args | keys) | length == 0) and
  ([.build_args | keys[] | select(test("^NEXT_PUBLIC_[A-Z0-9_]+$") | not)] | length == 0) and
  ([.build_args | keys[] | select(test("(SECRET|PASSWORD|PRIVATE|TOKEN|ACCESS_KEY)"))] | length == 0) and
  ([.build_args[] | select(type != "string" or test("[\\r\\n]"))] | length == 0)
' "$config" >/dev/null || {
  echo "Studio manifest failed the shared release eligibility policy: $config" >&2
  exit 1
}
