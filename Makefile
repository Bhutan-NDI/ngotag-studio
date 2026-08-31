.PHONY: deploy-qa deploy-stage deploy-prod

DEPLOY_WAIT ?= true
DEPLOYMENT_CONFIG_REPOSITORY ?=

# A DevOps operator starts every release through one of these targets. Make pins the
# exact reviewed manifest and source commits in an immutable tag; the workflow then
# repeats every policy check before it can obtain AWS credentials.
deploy-qa:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=qa REQUIRED_BRANCH=develop

deploy-stage:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=stage REQUIRED_BRANCH=main

deploy-prod:
	@$(MAKE) --no-print-directory _release DEPLOY_ENV=prod REQUIRED_BRANCH=main

.PHONY: _release
_release:
	@test "$$(git rev-parse --abbrev-ref HEAD)" = "$(REQUIRED_BRANCH)" || (echo "deploy-$(DEPLOY_ENV) must be run from $(REQUIRED_BRANCH)" && exit 1)
	@test -z "$$(git status --porcelain)" || (echo "working tree must be clean before deployment" && exit 1)
	@git fetch origin "$(REQUIRED_BRANCH)" --tags
	@test "$$(git rev-parse HEAD)" = "$$(git rev-parse origin/$(REQUIRED_BRANCH))" || (echo "local HEAD must exactly match origin/$(REQUIRED_BRANCH)" && exit 1)
	@command -v gh >/dev/null || (echo "GitHub CLI (gh) is required" && exit 1)
	@command -v jq >/dev/null || (echo "jq is required" && exit 1)
	@command -v base64 >/dev/null || (echo "base64 is required" && exit 1)
	@set -eu; \
		config_repository="$(DEPLOYMENT_CONFIG_REPOSITORY)"; \
		test -n "$$config_repository" || { \
			echo "DEPLOYMENT_CONFIG_REPOSITORY is required" >&2; \
			exit 1; \
		}; \
		studio_repository="$$(gh repo view --json nameWithOwner --jq '.nameWithOwner')"; \
		source_sha="$$(git rev-parse HEAD)"; \
		source_short="$$(git rev-parse --short=12 HEAD)"; \
		manifest_ref="$$(gh api "repos/$${config_repository}/git/ref/heads/main" --jq '.object.sha')"; \
		manifest="$$(gh api "repos/$${config_repository}/contents/studio/environments/$(DEPLOY_ENV).json?ref=$${manifest_ref}" --jq '.content' | base64 --decode)"; \
		printf '%s' "$$manifest" | jq -e \
			--arg environment "$(DEPLOY_ENV)" \
			--arg branch "$(REQUIRED_BRANCH)" '
			.schema_version == 1 and
			.environment == $$environment and
			.enabled == true and
			.release.state == "pending" and
			.release.version == .build_args.NEXT_PUBLIC_CURRENT_RELEASE and
			.deployment.allowed_branch == $$branch
		' >/dev/null || { \
			echo "the current reviewed $(DEPLOY_ENV) manifest is not an eligible pending release" >&2; \
			exit 1; \
		}; \
		ci_state="$$(gh api "repos/$${studio_repository}/commits/$${source_sha}/check-runs" | jq -r '
			[.check_runs[] | select(.name == "Lint & Build" and .app.slug == "github-actions")]
			| sort_by(.started_at)
			| last
			| if . == null then "missing"
			  elif .status == "completed" and .conclusion == "success" then "success"
			  else ((.status // "unknown") + ":" + (.conclusion // "pending"))
			  end
		')"; \
		test "$$ci_state" = "success" || { \
			echo "Lint & Build has not succeeded for $$source_sha ($$ci_state)" >&2; \
			exit 1; \
		}; \
		release_tag="studio-$(DEPLOY_ENV)-$${manifest_ref}-$${source_short}-$$(date -u +%Y%m%dT%H%M%SZ)"; \
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
		git tag "$$release_tag" "$$source_sha"; \
		git push origin "refs/tags/$${release_tag}:refs/tags/$${release_tag}"; \
		echo "Release triggered: $$release_tag"; \
		if [ "$(DEPLOY_WAIT)" = "true" ]; then \
			run_id=""; attempts=0; \
			while [ -z "$$run_id" ] && [ "$$attempts" -lt 90 ]; do \
				run_id="$$(gh run list --repo "$$studio_repository" --commit "$$source_sha" \
					--event push --limit 50 --json databaseId,displayTitle \
					| jq -r --arg tag "$$release_tag" '.[] | select(.displayTitle | contains($$tag)) | .databaseId' \
					| head -n 1)"; \
				[ -n "$$run_id" ] || sleep 2; \
				attempts=$$((attempts + 1)); \
			done; \
			test -n "$$run_id" || { echo "could not locate dispatched workflow run" >&2; exit 1; }; \
			gh run watch "$$run_id" --repo "$$studio_repository" --exit-status; \
		else \
			echo "Track the release tag in the repository Actions page: $$release_tag"; \
		fi
