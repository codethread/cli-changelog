# CLI Changelog

Shared changelog schemas, version selection, pagination, JSON Schema and text rendering for Bun CLIs. Requires Bun for semantic version ordering and consumes the application's Zod installation through a `^4.6.5` peer dependency.

The package exports `changelogVersionSchema`, `changelogCategorySchema`, `changelogChangeSchema`, `changelogReleaseSchema`, `changelogHistorySchema`, `changelogQuerySchema`, `changelogSchema`, `queryChangelog`, `renderChangelog` and `renderChangelogMarkdown`, plus the associated TypeScript types. Consumers own their history JSON, installed version, CLI options and output envelope.

The repository lake selects Mail for direct agent messages, identity links, and automatic live delivery or session resumption within five minutes of a normal stop. Use `bl prime mail` for the messaging runbook.

## Consumption

Install [@codethread/cli-changelog from npm](https://www.npmjs.com/package/@codethread/cli-changelog) and its Zod peer dependency:

```sh
bun add @codethread/cli-changelog zod@^4.6.5
```

Commit the consumer's Bun lockfile and install with `bun install --frozen-lockfile` in CI. The package exports TypeScript source for Bun consumers. Compiled Bun executables can bundle the library and run without Bun or a source checkout.

## Development setup

Install [mise](https://mise.jdx.dev), review this repository's `mise.toml`, trust it once, then run `mise run` from the repository root. The default task is also available as `mise run bootstrap`; it selects Bun 1.4.2, installs all root workspace dependencies from the frozen lockfile, and regenerates this repository's `CHANGELOG.md`. Re-running setup is safe. Run `bun run check` for formatting, linting, typechecking and tests.

## Changelog

The package records its own releases in [`changelog.json`](changelog.json), generates [`CHANGELOG.md`](CHANGELOG.md), and queries them with its own schemas, selection and rendering functions. After installing the package, use its Bun-powered command:

```sh
bunx --bun @codethread/cli-changelog changelog
bunx --bun @codethread/cli-changelog changelog --since 0.1.0 --json
bunx --bun @codethread/cli-changelog changelog --release 0.1.0
bunx --bun @codethread/cli-changelog changelog --schema
```

In this repository, use `bun run changelog` with the same options. `--limit` and `--offset` paginate changes; without a version selector, the command shows the latest recorded release. The installed command reads only packaged history and requires no Git checkout or network access.

## Generating CHANGELOG.md

`renderChangelogMarkdown({ title, history })` renders **complete history**, newest version first, without the CLI's installed-version cutoff or pagination. It returns a string; your build or release script chooses the input and output paths:

```ts
import { changelogHistorySchema, renderChangelogMarkdown } from "@codethread/cli-changelog";

const history = changelogHistorySchema.parse(await Bun.file("changelog.json").json());
await Bun.write("CHANGELOG.md", renderChangelogMarkdown({ title: "my-tool", history }));
```

This replaces the output file rather than appending to it. Keep curated history JSON as the source of truth; the helper does not extract release notes from Git or merge handwritten Markdown edits.

The layout is inspired by [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): a `# Changelog` heading, newest-first `## VERSION` sections, and bulleted changes. It preserves commit references, Markdown bodies, breaking notes, and required/optional adoption instructions. Titles, summaries and notes are rendered as plain text; bodies are trusted, authored Markdown.

Release dates and change categories are optional:

```json
[
	{
		"version": "1.0.0",
		"date": "2026-11-12",
		"changes": [
			{
				"commit": "abcdef0123456789",
				"summary": "Add offline history queries.",
				"category": "added",
				"body": "",
				"breaking": [],
				"adoption": []
			}
		]
	}
]
```

- Release `date`: a valid calendar date in `YYYY-MM-DD` format. When present, the heading is `## VERSION - YYYY-MM-DD`; otherwise it is `## VERSION`.
- Change `category`: one of `added`, `changed`, `deprecated`, `removed`, `fixed`, or `security`. Markdown groups changes in that order under Added, Changed, Deprecated, Removed, Fixed, and Security, preserving entry order within each category. Uncategorized changes appear under a final `### Changes` section. Empty categories are omitted.

Dates and categories are retained in paginated JSON responses and exposed in the response JSON Schema. The CLI's text rendering includes recorded dates and category labels. Missing metadata is never inferred. The Markdown helper does not invent release or comparison URLs. Empty recorded releases are shown explicitly; empty history produces only the document heading and introduction.

To regenerate this repository's full Markdown changelog from its recorded JSON:

```sh
bun run changelog:generate
```

The test suite checks that the generated file stays in sync with the source history.

### Monorepos

Choose the changelog boundary based on **versioning**, not repository layout:

- **Single project or lockstep monorepo:** keep one history for the shared release version and generate a root `CHANGELOG.md`. Include package names in summaries when useful.
- **Independently versioned packages:** keep a history per package and generate `packages/<name>/CHANGELOG.md`. Call the helper separately so identical version numbers in different packages remain unrelated.

For example, a release script for independent packages can use explicit paths:

```ts
import { changelogHistorySchema, renderChangelogMarkdown } from "@codethread/cli-changelog";

for (const name of ["cli", "core"]) {
	const directory = `packages/${name}`;
	const history = changelogHistorySchema.parse(
		await Bun.file(`${directory}/changelog.json`).json(),
	);
	await Bun.write(
		`${directory}/CHANGELOG.md`,
		renderChangelogMarkdown({ title: `@example/${name}`, history }),
	);
}
```

The library does not discover workspaces, assign changes to packages, or choose versions. Those responsibilities stay with your release tooling. The packaged `cli-changelog changelog` command still reads only this package's own history; Markdown generation is a library API.

## Development

Run `bun install --frozen-lockfile`, then `bun run check` for formatting, linting, typechecking and the library tests. The consumer repositories test their own CLI integration against their recorded release data.

## License

MIT. See [LICENSE](LICENSE).
