# CLI Changelog

Shared changelog schemas, version selection, pagination, JSON Schema and text rendering for Bun CLIs. Requires Bun for semantic version ordering; Zod is the only package dependency.

The package exports `changelogVersionSchema`, `changelogChangeSchema`, `changelogReleaseSchema`, `changelogHistorySchema`, `changelogQuerySchema`, `changelogSchema`, `queryChangelog` and `renderChangelog`, plus the associated TypeScript types. Consumers own their history JSON, installed version, CLI options and output envelope.

## Consumption

Pin the GitHub repository to a full commit SHA in the consumer's `package.json`:

```json
{
	"dependencies": {
		"@codethread/cli-changelog": "github:codethread/cli-changelog#<commit-sha>"
	}
}
```

Commit the consumer's Bun lockfile and install with `bun install --frozen-lockfile`. Qlock and Wktree use this dependency directly for source and CI builds. Their compiled executables bundle the library and run without Bun or a source checkout. The package stays private to npm; Bun installs it from the public GitHub repository.

## Development

Run `bun install --frozen-lockfile`, then `bun run check` for formatting, linting, typechecking and the library tests. The consumer repositories test their own CLI integration against their recorded release data.
