# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Fixed

- Validate the packed module in a fresh Nuxt consumer before pushing a release tag, and make publication retries reuse the tagged version.

### Added

- Add a year view, touch swipe navigation and a floating mobile action toolbar.
- Shade weekend columns, dim dates outside the visible month and improve touch targets.
- Allow using a custom event modal for event creation and editing.
- Support alpha, beta, and release candidate versions in the release workflow, published under separate npm dist-tags.
