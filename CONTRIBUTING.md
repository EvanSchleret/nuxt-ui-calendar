# Contributing

Thanks for helping improve `@evanschleret/nuxt-ui-calendar`.

## Prerequisites

- Bun 1.4.3
- Nuxt 4 and Nuxt UI 4 for the playground

## Local setup

Install dependencies with Bun:

```sh
bun install
```

The `playground/` directory demonstrates the module in a Nuxt application.

## Changes and commits

- Keep changes focused and follow the existing TypeScript and Vue conventions.
- Use a short, descriptive branch name.
- Use a clear commit message, preferably in the Conventional Commits style, such as `fix: handle offline retries`.
- Discuss larger changes in a GitHub issue before investing in implementation.

## Checks

Before opening a pull request, run the checks relevant to your change:

```sh
bun run dev:prepare
bun run lint
bun run typecheck
bun run test
bun run build
bun run verify:package
```

The package verification builds a tarball, checks its runtime files and public types, then installs it in a fresh Nuxt consumer and runs Nuxt preparation and Vue type checking. It does not run a Nuxt app build. Add or update tests when behavior changes, and update the README when public APIs or usage change.

## Pull requests

- Explain the user problem and the changes made.
- Include tests and documentation updates where relevant.
- Call out breaking changes and any migration steps.
- Keep the pull request focused; split unrelated work into separate changes.

For questions and feature discussions, use [GitHub Issues](https://github.com/evanschleret/nuxt-ui-calendar/issues).

## Releasing

Maintainers start releases from the `main` branch with the **Release** workflow in GitHub Actions and choose a patch, minor, or major version bump. The workflow runs the repository checks, creates the version commit and tag locally, builds and verifies the npm tarball in a fresh Nuxt consumer, then pushes the commit and tag together. Only after that succeeds does it start **Publish** from the exact release tag. That workflow repeats the checks, rebuilds and verifies the same package, and publishes the verified tarball to npm with provenance.

If the Release workflow fails after the tag was pushed, rerun that workflow run; it detects and resumes the tagged version. If publication fails, rerun **Publish** for the same `v<version>` tag. The publish step checks npm first, so a retry after a successful but interrupted publish exits without publishing a duplicate version.

Add an `NPM_TOKEN` Actions secret with publish access to `@evanschleret/nuxt-ui-calendar` before running the workflow. The package is configured for public publication on `https://registry.npmjs.org/`.

After publishing, create a GitHub Release for the new tag. The **Update Changelog** workflow uses its release notes to update `CHANGELOG.md` on `main`.
