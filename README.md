# CLI Changelog

Shared changelog schemas, version selection, pagination, JSON Schema and text rendering for Bun CLIs. Requires Bun for semantic version ordering; Zod is the only package dependency.

The package exports `changelogVersionSchema`, `changelogChangeSchema`, `changelogReleaseSchema`, `changelogHistorySchema`, `changelogQuerySchema`, `changelogSchema`, `queryChangelog` and `renderChangelog`, plus the associated TypeScript types. Consumers own their history JSON, installed version, CLI options and output envelope.

## Local setup

From this checkout:

```sh
bun install --frozen-lockfile
bun link
```

Register the package before installing dependencies in a consumer. To add it to a new consumer:

```sh
bun link --save @codethread/cli-changelog
```

Qlock and Wktree use the registered package through `link:@codethread/cli-changelog`. Their compiled executables bundle the library and run without this checkout or Bun. Source builds, including CI and Homebrew builds of these commits, require this checkout installed and registered first.

## Development

Run `bun run check` for formatting, linting, typechecking and the library tests. The consumer repositories test their own CLI integration against their recorded release data.
