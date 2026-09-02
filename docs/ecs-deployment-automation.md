# Deployment automation

This public repository contains the Studio build and deployment workflow, but not
infrastructure topology, account identifiers, deployment targets, or runtime
settings. Those live in restricted operations repositories and GitHub Environments.

## Public configuration contract

- Every `NEXT_PUBLIC_*` Docker build argument is supplied from a reviewed,
  environment-specific configuration manifest during the image build.
- Public values are baked into the image. Changing one requires a new image; a
  service restart cannot update it.
- Server-side runtime configuration remains outside this repository.
- Do not put credentials, keys, tokens, passwords, private data, or internal URLs
  in a `NEXT_PUBLIC_*` setting.

## Release contract

An approved private release manifest moves through two states:

1. `pending`: a new SemVer release is requested.
2. `deployed`: the workflow has built an immutable image, completed the service
   health check, created the corresponding GitHub Release, and recorded the exact
   image tag, digest, source and manifest commits, ECS task definition, and
   timestamp back in the private manifest.

Before obtaining AWS credentials, the workflow also confirms that the selected
environment manifest still matches its current reviewed `main` copy. A stale
configuration is therefore rejected before any image or ECS mutation.

The release workflow enforces the organization’s branch policy, authenticates to
cloud resources using short-lived GitHub OIDC credentials, and uses narrowly scoped
GitHub App tokens for private configuration reads/writes and Release creation.
Environment branches, release-tag prefixes, and the required CI check identity are
defined once in `.github/studio-release-contract.json`. A secret-free resolver job
validates the immutable tag and exposes that policy as job outputs; only the selected,
protected deployment job receives GitHub Environment secrets and OIDC permission.

The workflow derives the ECR image tag itself from the approved SemVer release,
the exact source commit, and a hash of the approved private manifest. It will never
accept a caller-provided image tag or overwrite an existing tag. This keeps a
configuration-only release just as traceable as a source-code release.

`make deploy-qa`, `make deploy-stage`, and `make deploy-prod` are the only supported
operator entry points. A DevOps operator supplies the restricted configuration
repository locator through `DEPLOYMENT_CONFIG_REPOSITORY`; Make verifies the current
manifest is enabled and pending, confirms the exact permitted source-branch head and
its successful `Lint & Build` check, and pushes an immutable release-trigger tag.
Make and the workflow invoke the same
`.github/scripts/validate-studio-manifest.sh` policy, so an ineligible manifest is
rejected before tag creation as well as before AWS access.
The tag pins both the full manifest commit and the source commit. The workflow
rejects malformed tags and repeats the manifest, branch, source, and CI checks
before obtaining AWS credentials. It then builds and pushes the image using an
environment-scoped GitHub Actions layer cache, clones the task definition currently
used by the service, registers a new revision with only the intended container
image changed, deploys it, and verifies that ECS stabilized on that exact revision
before publishing the release ledger.

A reviewed public-build configuration change in the private manifest repository
prepares a pending release but never deploys it. Disabled environments never prepare
a release, and deployment-ledger updates are ignored. A DevOps operator must still
run the matching Make target from the permitted Studio branch; pushing release tags
or invoking the workflow directly is not an approved release path.

Operational setup and environment details are intentionally maintained in the
private infrastructure repositories.
