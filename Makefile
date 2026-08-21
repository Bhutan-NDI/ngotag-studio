.PHONY: deploy-qa deploy-stage deploy-prod

DEPLOY_WORKFLOW ?= deploy-studio.yml

# These targets only dispatch a GitHub Actions workflow. The workflow repeats every
# branch/environment check, so bypassing Make cannot bypass the release policy.
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
	@gh workflow run "$(DEPLOY_WORKFLOW)" --ref "$(REQUIRED_BRANCH)" \
		-f environment="$(DEPLOY_ENV)"
	@echo "Deployment dispatched. Track it with: gh run list --workflow $(DEPLOY_WORKFLOW) --limit 1"
