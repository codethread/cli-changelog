# CLI Changelog

Shared changelog schemas, version selection, pagination, JSON Schema and text rendering for Bun CLIs. Requires Bun for semantic version ordering and consumes the application's Zod installation through a `^4.6.5` peer dependency.

The package exports `changelogVersionSchema`, `changelogChangeSchema`, `changelogReleaseSchema`, `changelogHistorySchema`, `changelogQuerySchema`, `changelogSchema`, `queryChangelog` and `renderChangelog`, plus the associated TypeScript types. Consumers own their history JSON, installed version, CLI options and output envelope.

## Consumption

Install the public npm package and its Zod peer dependency:

```sh
bun add @codethread/cli-changelog zod@^4.6.5
```

Commit the consumer's Bun lockfile and install with `bun install --frozen-lockfile` in CI. The package exports TypeScript source for Bun consumers. Compiled Bun executables can bundle the library and run without Bun or a source checkout.

## Changelog

The package records its own releases in [`changelog.json`](changelog.json) and queries them with its own schemas, selection and rendering functions. After installing the package, use its Bun-powered command:

```sh
bunx --bun @codethread/cli-changelog changelog
bunx --bun @codethread/cli-changelog changelog --since 0.1.0 --json
bunx --bun @codethread/cli-changelog changelog --release 0.1.0
bunx --bun @codethread/cli-changelog changelog --schema
```

In this repository, use `bun run changelog` with the same options. `--limit` and `--offset` paginate changes; without a version selector, the command shows the latest recorded release. The installed command reads only packaged history and requires no Git checkout or network access.

## Development

Run `bun install --frozen-lockfile`, then `bun run check` for formatting, linting, typechecking and the library tests. The consumer repositories test their own CLI integration against their recorded release data.

## License

MIT. See [LICENSE](LICENSE).
