.PHONY: deploy-qa deploy-stage deploy-prod

DEPLOY_WORKFLOW ?= deploy-studio.yml
DEPLOY_WAIT ?= true

# These targets only dispatch a GitHub Actions workflow. The workflow repeats every
# branch/environment check, so bypassing Make cannot bypass the release policy.
# The mapping is deliberately repeated in the manifest dispatcher, GitHub
# Environment restrictions, and deployment workflow as independent security gates.
deploy-qa:
	@$(MAKE) --no-print-directory _dispatch DEPLOY_ENV=qa REQUIRED_BRANCH=develop

deploy-stage:
	@$(MAKE) --no-print-directory _dispatch DEPLOY_ENV=stage REQUIRED_BRANCH=main

deploy-prod:
	@$(MAKE) --no-print-directory _dispatch DEPLOY_ENV=prod REQUIRED_BRANCH=main

.PHONY: _dispatch
_dispatch:
	@test "$$(git rev-parse --abbrev-ref HEAD)" = "$(REQUIRED_BRANCH)" || (echo "deploy-$(DEPLOY_ENV) must be run from $(REQUIRED_BRANCH)" && exit 1)
	@test -z "$$(git status --porcelain)" || (echo "working tree must be clean before deployment" && exit 1)
	@git fetch origin "$(REQUIRED_BRANCH)" --tags
	@test "$$(git rev-parse HEAD)" = "$$(git rev-parse origin/$(REQUIRED_BRANCH))" || (echo "local HEAD must exactly match origin/$(REQUIRED_BRANCH)" && exit 1)
	@command -v gh >/dev/null || (echo "GitHub CLI (gh) is required" && exit 1)
	@command -v jq >/dev/null || (echo "jq is required" && exit 1)
	@set -eu; \
		request_id="manual-$(DEPLOY_ENV)-$$(date -u +%Y%m%dT%H%M%SZ)-$$(git rev-parse --short=12 HEAD)"; \
		gh workflow run "$(DEPLOY_WORKFLOW)" --ref "$(REQUIRED_BRANCH)" \
			-f environment="$(DEPLOY_ENV)" \
			-f source_sha="$$(git rev-parse HEAD)" \
			-f request_id="$$request_id"; \
		echo "Deployment dispatched: $$request_id"; \
		if [ "$(DEPLOY_WAIT)" = "true" ]; then \
			run_id=""; attempts=0; \
			while [ -z "$$run_id" ] && [ "$$attempts" -lt 90 ]; do \
				run_id="$$(gh run list --workflow "$(DEPLOY_WORKFLOW)" --branch "$(REQUIRED_BRANCH)" \
					--event workflow_dispatch --limit 30 --json databaseId,displayTitle \
					| jq -r --arg request "$$request_id" '.[] | select(.displayTitle | contains($$request)) | .databaseId' \
					| head -n 1)"; \
				[ -n "$$run_id" ] || sleep 2; \
				attempts=$$((attempts + 1)); \
			done; \
			test -n "$$run_id" || { echo "could not locate dispatched workflow run" >&2; exit 1; }; \
			gh run watch "$$run_id" --exit-status; \
		else \
			echo "Track it with: gh run list --workflow $(DEPLOY_WORKFLOW) --limit 1"; \
		fi
