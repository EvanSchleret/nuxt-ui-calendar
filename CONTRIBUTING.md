# Contributing

Thanks for helping improve `@evanschleret/nuxt-ui-calendar`.

## Prerequisites

- Bun 1.3.12 or newer
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
