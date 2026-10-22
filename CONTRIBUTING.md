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
bun test
bun run typecheck
```

There is no lint script configured at this time. Add or update tests when behavior changes, and update the README when public APIs or usage change.

## Pull requests

- Explain the user problem and the changes made.
- Include tests and documentation updates where relevant.
- Call out breaking changes and any migration steps.
- Keep the pull request focused; split unrelated work into separate changes.

For questions and feature discussions, use [GitHub Issues](https://github.com/evanschleret/nuxt-ui-calendar/issues).

## Releasing

Maintainers can start a release from the **Release** workflow in GitHub Actions and choose a patch, minor, or major version bump. The workflow runs lint, typecheck, and tests, creates the version commit and tag with Bun, pushes them to GitHub, builds the package, and publishes it to npm with provenance.

Add an `NPM_TOKEN` Actions secret with publish access to `@evanschleret/nuxt-ui-calendar` before running the workflow. The package is configured for public publication on `https://registry.npmjs.org/`.

After publishing, create a GitHub Release for the new tag. The **Update Changelog** workflow uses its release notes to update `CHANGELOG.md` on `main`.
