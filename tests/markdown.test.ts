import type { ChangelogChange, ChangelogRelease } from "../src/index.ts";
import { expect, test } from "bun:test";
import { renderChangelogMarkdown } from "../src/index.ts";

const ONE = 1;
const change: ChangelogChange = {
	commit: "d7e55e9fb000d05b255240210a7df3694c0447df",
	summary: "Support local dependencies",
	body: "Use **local dependencies**.\n\n```sh\nexample inspect RUN\n```",
	breaking: ["Remove the old flag"],
	adoption: [
		{ requirement: "required", text: "Rename the flag" },
		{ requirement: "optional", text: "Rebuild the executable" },
	],
};

test("Markdown preserves change details, Markdown bodies and explicit migration requirements", () => {
	expect(
		renderChangelogMarkdown({
			title: "example",
			history: [{ version: "1.0.0", changes: [change] }],
		}),
	).toBe(`# Changelog

All notable changes to example are documented in this file.

## 1.0.0

### Changes

- Support local dependencies (d7e55e9)

  Use **local dependencies**.

  \`\`\`sh
  example inspect RUN
  \`\`\`

  - **Breaking:** Remove the old flag
  - **Adoption (required):** Rename the flag
  - **Adoption (optional):** Rebuild the executable
`);
});

test("Markdown renders complete history newest first without mutating or paginating it", () => {
	const count = 125;
	const history: ChangelogRelease[] = [
		{ version: "1.2.0", changes: Array.from({ length: count }, () => change) },
		{ version: "1.10.0", changes: [] },
		{ version: "1.0.0", changes: [] },
	];
	const original = structuredClone(history);
	const markdown = renderChangelogMarkdown({ title: "example", history });
	expect(markdown.match(/^## .+$/gmu)).toEqual(["## 1.10.0", "## 1.2.0", "## 1.0.0"]);
	expect(markdown.match(/^- Support local dependencies/gmu)).toHaveLength(count);
	expect(markdown).toContain("## 1.10.0\n\nNo recorded changes.");
	expect(history).toEqual(original);
});

test("simple entries and bodies without migration notes have consistent spacing", () => {
	const markdown = renderChangelogMarkdown({
		title: "my-tool",
		history: [
			{
				version: "1.0.0",
				changes: [
					{
						...change,
						summary: "First change.",
						body: "Details.\r\nSecond line.",
						breaking: [],
						adoption: [],
					},
					{ ...change, summary: "Second change.", body: "", breaking: [], adoption: [] },
				],
			},
		],
	});
	expect(markdown).toBe(`# Changelog

All notable changes to my-tool are documented in this file.

## 1.0.0

### Changes

- First change. (d7e55e9)

  Details.
  Second line.

- Second change. (d7e55e9)
`);
});

test("empty history produces a document without fabricated releases", () => {
	expect(renderChangelogMarkdown({ title: "example", history: [] })).toBe(
		"# Changelog\n\nAll notable changes to example are documented in this file.\n",
	);
});

test("independently versioned packages can render the same version without mixing histories", () => {
	const packages = ["@example/cli", "@example/core"];
	for (const title of packages) {
		const markdown = renderChangelogMarkdown({
			title,
			history: [{ version: "1.0.0", changes: [{ ...change, summary: `Update ${title}` }] }],
		});
		expect(markdown).toContain(`All notable changes to ${title} are documented in this file.`);
		expect(markdown).toContain(`- Update ${title}`);
		expect(markdown.match(/^## /gmu)).toHaveLength(ONE);
	}
});

test("plain-text fields cannot introduce Markdown headings, links or HTML", () => {
	const markdown = renderChangelogMarkdown({
		title: "[example]\n# heading <tag>",
		history: [
			{
				version: "1.0.0",
				changes: [
					{
						...change,
						summary: "[link](url) *text*\n## injected",
						body: "",
						breaking: ["<script>"],
						adoption: [],
					},
				],
			},
		],
	});
	expect(markdown).toContain(String.raw`\[example\] \# heading &lt;tag&gt;`);
	expect(markdown).toContain(String.raw`- \[link\]\(url\) \*text\* \#\# injected`);
	expect(markdown).toContain("**Breaking:** &lt;script&gt;");
	expect(markdown.match(/^## .+$/gmu)).toEqual(["## 1.0.0"]);
});

test("Markdown uses recorded dates and conventional category order, keeping unclassified changes", () => {
	const simple = { ...change, body: "", breaking: [], adoption: [] };
	const history: ChangelogRelease[] = [
		{
			version: "1.0.0",
			date: "2026-11-12",
			changes: [
				{ ...simple, category: "security", summary: "Security fix" },
				{ ...simple, category: "fixed", summary: "First fix" },
				{ ...simple, category: "removed", summary: "Remove feature" },
				{ ...simple, category: "deprecated", summary: "Deprecate feature" },
				{ ...simple, category: "changed", summary: "Change behavior" },
				{ ...simple, category: "added", summary: "Add feature" },
				{ ...simple, category: "fixed", summary: "Second fix" },
				{ ...simple, summary: "Unclassified" },
			],
		},
	];
	const original = structuredClone(history);
	const markdown = renderChangelogMarkdown({ title: "example", history });
	expect(markdown).toContain("## 1.0.0 - 2026-11-12");
	expect(markdown.match(/^### .+$/gmu)).toEqual([
		"### Added",
		"### Changed",
		"### Deprecated",
		"### Removed",
		"### Fixed",
		"### Security",
		"### Changes",
	]);
	expect(markdown).toContain("### Fixed\n\n- First fix (d7e55e9)\n\n- Second fix (d7e55e9)");
	expect(markdown).toContain("### Changes\n\n- Unclassified (d7e55e9)");
	expect(history).toEqual(original);
});

test("Markdown supports categories without dates and dates on empty releases", () => {
	const markdown = renderChangelogMarkdown({
		title: "example",
		history: [
			{ version: "1.0.0", changes: [{ ...change, category: "added" }] },
			{ version: "0.9.0", date: "2026-11-08", changes: [] },
		],
	});
	expect(markdown).toContain("## 1.0.0\n\n### Added");
	expect(markdown).toContain("**Breaking:** Remove the old flag");
	expect(markdown).toContain("## 0.9.0 - 2026-11-08\n\nNo recorded changes.");
	expect(markdown).not.toContain("### Fixed");
	expect(markdown).not.toContain("### Changes");
});
