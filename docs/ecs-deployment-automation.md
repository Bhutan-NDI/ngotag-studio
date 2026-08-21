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
   image tag, digest, commit, and timestamp back in the private manifest.

The release workflow enforces the organization’s branch policy, authenticates to
cloud resources using short-lived GitHub OIDC credentials, and uses narrowly scoped
GitHub App tokens for private configuration reads/writes and Release creation.

The workflow derives the ECR image tag itself from the approved SemVer release,
the exact source commit, and a hash of the approved private manifest. It will never
accept a caller-provided image tag or overwrite an existing tag. This keeps a
configuration-only release just as traceable as a source-code release.

Operational setup and environment details are intentionally maintained in the
private infrastructure repositories.
