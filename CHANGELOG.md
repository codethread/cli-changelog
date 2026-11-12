# Changelog

All notable changes to @codethread/cli-changelog are documented in this file.

## 0.1.1 - 2026-11-11

### Added

- Record and query this package's own changelog using its shared library. (e6bb48e)

  Ship recorded release history and a Bun-powered cli-changelog command with text, JSON, release selection, pagination and JSON Schema output. Run bun run changelog in the repository or cli-changelog changelog after installation.

## 0.1.0 - 2026-11-08

### Added

- Extract shared changelog schemas, queries and rendering for Bun CLIs. (1587bc0)

  Provide version selection, pagination, JSON Schema and human-readable rendering over recorded release history.

### Fixed

- Consume the application's Zod installation through a peer dependency. (f2d7736)

  - **Adoption (required):** Install zod@^4.6.5 alongside @codethread/cli-changelog.
