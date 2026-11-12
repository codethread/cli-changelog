import { changelogHistorySchema, renderChangelogMarkdown } from "../src/index.ts";
import history from "../changelog.json";
import manifest from "../package.json";

await Bun.write(
	new URL("../CHANGELOG.md", import.meta.url),
	renderChangelogMarkdown({
		title: manifest.name,
		history: changelogHistorySchema.parse(history),
	}),
);
