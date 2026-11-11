#!/usr/bin/env bun
import {
	changelogHistorySchema,
	changelogQuerySchema,
	changelogSchema,
	queryChangelog,
	renderChangelog,
} from "./index.ts";
import history from "../changelog.json";
import manifest from "../package.json";
// eslint-disable-next-line import/no-nodejs-modules -- This command runs in Bun, which provides node:util.
import { parseArgs } from "node:util";

const FIRST = 0;
const ONE = 1;
const ARGUMENT_OFFSET = 2;
const help = `Usage: cli-changelog changelog [options]

Read this package's recorded release history offline.

  --since VERSION    Releases newer than VERSION (exclusive)
  --release VERSION  Select an exact release
  --limit COUNT      Maximum changes per page (1–100; default 20)
  --offset COUNT     Skip changes (default 0)
  --json             Print the response as JSON
  --schema           Print the response JSON Schema
  --help             Show this help
`;
const { values, positionals } = parseArgs({
	args: Bun.argv.slice(ARGUMENT_OFFSET),
	allowPositionals: true,
	strict: true,
	options: {
		since: { type: "string" },
		release: { type: "string" },
		limit: { type: "string" },
		offset: { type: "string" },
		json: { type: "boolean" },
		schema: { type: "boolean" },
		help: { type: "boolean" },
	},
});

if (values.help) {
	process.stdout.write(help);
} else {
	if (positionals.length !== ONE || positionals[FIRST] !== "changelog") {
		throw new Error(help);
	}
	const query = changelogQuerySchema.parse(values);
	if (values.schema) {
		process.stdout.write(`${JSON.stringify(changelogSchema())}\n`);
	} else {
		const page = queryChangelog(
			{ tool: "cli-changelog", version: manifest.version },
			changelogHistorySchema.parse(history),
			query,
		);
		if (values.json) {
			process.stdout.write(`${JSON.stringify(page)}\n`);
		} else {
			process.stdout.write(renderChangelog(page));
		}
	}
}
