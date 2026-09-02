.PHONY: deploy-qa deploy-stage deploy-prod

DEPLOY_WAIT ?= true
DEPLOYMENT_CONFIG_REPOSITORY ?=
RELEASE_CONTRACT := .github/studio-release-contract.json
CONTRACT_VALIDATOR := .github/scripts/validate-studio-release-contract.sh
MANIFEST_VALIDATOR := .github/scripts/validate-studio-manifest.sh

# A DevOps operator starts every release through one of these targets. Make pins the
# exact reviewed manifest and source commits in an immutable tag; the workflow then
# repeats every policy check before it can obtain AWS credentials.
# Environment branches, tag prefixes, and the required CI check are defined once in
# RELEASE_CONTRACT. Only deploy-studio.yml's trigger globs must be kept in sync.
deploy-qa:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=qa

deploy-stage:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=stage

deploy-prod:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=prod

.PHONY: _release
_release:
	@command -v gh >/dev/null || (echo "GitHub CLI (gh) is required" && exit 1)
	@command -v jq >/dev/null || (echo "jq is required" && exit 1)
	@command -v base64 >/dev/null || (echo "base64 is required" && exit 1)
	@command -v cut >/dev/null || (echo "cut is required" && exit 1)
	@set -eu; \
		test -f "$(RELEASE_CONTRACT)" || { echo "release contract is missing" >&2; exit 1; }; \
		test -f "$(CONTRACT_VALIDATOR)" || { echo "release contract validator is missing" >&2; exit 1; }; \
		test -f "$(MANIFEST_VALIDATOR)" || { echo "manifest validator is missing" >&2; exit 1; }; \
		sh "$(CONTRACT_VALIDATOR)" "$(RELEASE_CONTRACT)"; \
		required_branch="$$(jq -er --arg environment "$(DEPLOY_ENV)" \
			'.environments[$$environment].allowed_branch // empty' "$(RELEASE_CONTRACT)")"; \
		tag_prefix="$$(jq -er --arg environment "$(DEPLOY_ENV)" \
			'.environments[$$environment].tag_prefix // empty' "$(RELEASE_CONTRACT)")"; \
		ci_check_name="$$(jq -er '.ci.check_name // empty' "$(RELEASE_CONTRACT)")"; \
		ci_app_slug="$$(jq -er '.ci.app_slug // empty' "$(RELEASE_CONTRACT)")"; \
		test "$$(git rev-parse --abbrev-ref HEAD)" = "$$required_branch" || { \
			echo "deploy-$(DEPLOY_ENV) must be run from $$required_branch" >&2; \
			exit 1; \
		}; \
		test -z "$$(git status --porcelain)" || { echo "working tree must be clean before deployment" >&2; exit 1; }; \
		git fetch origin "$$required_branch" --tags; \
		test "$$(git rev-parse HEAD)" = "$$(git rev-parse "origin/$$required_branch")" || { \
			echo "local HEAD must exactly match origin/$$required_branch" >&2; \
			exit 1; \
		}; \
		config_repository="$(DEPLOYMENT_CONFIG_REPOSITORY)"; \
		test -n "$$config_repository" || { \
			echo "DEPLOYMENT_CONFIG_REPOSITORY is required" >&2; \
			exit 1; \
		}; \
		studio_repository="$$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"; \
		source_sha="$$(git rev-parse HEAD)"; \
		source_short="$$(printf '%s' "$$source_sha" | cut -c1-12)"; \
		manifest_ref="$$(gh api "repos/$${config_repository}/git/ref/heads/main" --jq '.object.sha')"; \
		manifest_content="$$(gh api "repos/$${config_repository}/contents/studio/environments/$(DEPLOY_ENV).json?ref=$${manifest_ref}" --jq '.content')"; \
		manifest_file="$$(mktemp)"; \
		trap 'rm -f "$$manifest_file"' EXIT HUP INT TERM; \
		printf '%s' "$$manifest_content" | base64 --decode > "$$manifest_file"; \
		sh "$(MANIFEST_VALIDATOR)" "$(DEPLOY_ENV)" "$$required_branch" "$$manifest_file"; \
		check_runs="$$(gh api "repos/$${studio_repository}/commits/$${source_sha}/check-runs")"; \
		ci_state="$$(printf '%s' "$$check_runs" | jq -r \
			--arg check_name "$$ci_check_name" --arg app_slug "$$ci_app_slug" '
			[.check_runs[] | select(.name == $$check_name and .app.slug == $$app_slug)]
			| sort_by(.started_at)
			| last
			| if . == null then "missing"
			  elif .status == "completed" and .conclusion == "success" then "success"
			  else ((.status // "unknown") + ":" + (.conclusion // "pending"))
			  end
		')"; \
		test "$$ci_state" = "success" || { \
			echo "$$ci_check_name has not succeeded for $$source_sha ($$ci_state)" >&2; \
			exit 1; \
		}; \
		release_tag="$${tag_prefix}$${manifest_ref}-$${source_short}-$$(date -u +%Y%m%dT%H%M%SZ)"; \
		git check-ref-format "refs/tags/$${release_tag}" >/dev/null; \
		set +e; \
		git ls-remote --exit-code --tags origin "refs/tags/$${release_tag}" >/dev/null 2>&1; \
		remote_tag_status=$$?; \
		set -e; \
		case "$$remote_tag_status" in \
			2) ;; \
			0) echo "release trigger tag already exists: $$release_tag" >&2; exit 1 ;; \
			*) echo "could not verify release trigger tag absence" >&2; exit "$$remote_tag_status" ;; \
		esac; \
		git tag "$$release_tag" "$$source_sha" || { \
			echo "release trigger tag already exists locally or was created concurrently: $$release_tag" >&2; \
			exit 1; \
		}; \
		git push origin "refs/tags/$${release_tag}:refs/tags/$${release_tag}" || { \
			echo "failed to create release trigger tag; another invocation may have won the race after the absence check: $$release_tag" >&2; \
			exit 1; \
		}; \
		echo "Release triggered: $$release_tag"; \
		if [ "$(DEPLOY_WAIT)" = "true" ]; then \
			run_id=""; attempts=0; \
			while [ -z "$$run_id" ] && [ "$$attempts" -lt 90 ]; do \
				workflow_runs="$$(gh api "repos/$${studio_repository}/actions/runs?head_sha=$${source_sha}&event=push&per_page=100")"; \
				matches="$$(printf '%s' "$$workflow_runs" \
					| jq -r --arg tag "$$release_tag" '.workflow_runs[] | select(.path == ".github/workflows/deploy-studio.yml" and (.display_title | contains($$tag))) | .id')"; \
				run_id="$$(printf '%s\n' "$$matches" | head -n 1)"; \
				[ -n "$$run_id" ] || sleep 2; \
				attempts=$$((attempts + 1)); \
			done; \
			test -n "$$run_id" || { echo "could not locate dispatched workflow run" >&2; exit 1; }; \
			gh run watch "$$run_id" --repo "$$studio_repository" --exit-status; \
		else \
			echo "Track the release tag in the repository Actions page: $$release_tag"; \
		fi
