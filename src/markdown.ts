import type { ChangelogChange, ChangelogRelease } from "./index.ts";

const FIRST = 0;
const ONE = 1;
const SHORT_HASH_LENGTH = 7;
const sections = [
	{ category: "added", heading: "Added" },
	{ category: "changed", heading: "Changed" },
	{ category: "deprecated", heading: "Deprecated" },
	{ category: "removed", heading: "Removed" },
	{ category: "fixed", heading: "Fixed" },
	{ category: "security", heading: "Security" },
	{ category: undefined, heading: "Changes" },
] satisfies { category: ChangelogChange["category"]; heading: string }[];

/** Plain-text fields stay inline; only change bodies are treated as authored Markdown. */
function inline(text: string): string {
	return text
		.replaceAll(/\r\n?|\n/gu, " ")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll(/[\\`*_[\]()#]/gu, String.raw`\$&`);
}

function indentBodyLine(line: string): string {
	if (line === "") {
		return line;
	}
	return `  ${line}`;
}

function renderChange(change: ChangelogChange): string[] {
	const commit = inline(change.commit.slice(FIRST, SHORT_HASH_LENGTH));
	const lines = [`- ${inline(change.summary)} (${commit})`];
	if (change.body !== "") {
		lines.push("", ...change.body.split(/\r\n?|\n/u).map((line) => indentBodyLine(line)));
	}
	const notes = [
		...change.breaking.map((note) => `  - **Breaking:** ${inline(note)}`),
		...change.adoption.map(
			(note) => `  - **Adoption (${note.requirement}):** ${inline(note.text)}`,
		),
	];
	if (notes.length > FIRST) {
		lines.push("", ...notes);
	}
	return lines;
}

function renderSections(changes: ChangelogChange[]): string[] {
	const lines: string[] = [];
	for (const section of sections) {
		const entries = changes.filter((change) => change.category === section.category);
		if (entries.length > FIRST) {
			lines.push(`### ${section.heading}`);
			for (const entry of entries) {
				lines.push("", ...renderChange(entry));
			}
			lines.push("");
		}
	}
	return lines.slice(FIRST, -ONE);
}

function releaseHeading(release: ChangelogRelease): string {
	if (release.date !== undefined) {
		return `## ${release.version} - ${release.date}`;
	}
	return `## ${release.version}`;
}

/**
 * Render complete, parsed history as a Keep a Changelog–inspired Markdown document.
 * Call once per versioned unit: a repository, a lockstep release group, or a package.
 * File locations and writes belong to the caller; no installed-version cutoff or pagination applies.
 */
export function renderChangelogMarkdown({
	title,
	history,
}: {
	title: string;
	history: ChangelogRelease[];
}): string {
	const lines = [
		"# Changelog",
		"",
		`All notable changes to ${inline(title)} are documented in this file.`,
	];
	const ordered = history.toSorted((left, right) => Bun.semver.order(right.version, left.version));
	for (const release of ordered) {
		lines.push("", releaseHeading(release), "");
		if (release.changes.length === FIRST) {
			lines.push("No recorded changes.");
		} else {
			lines.push(...renderSections(release.changes));
		}
	}
	return `${lines.join("\n").trimEnd()}\n`;
}
