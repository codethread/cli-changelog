import { expect, test } from "bun:test";
import { queryChangelog, renderChangelog } from "../src/index.ts";
import type { ChangelogRelease } from "../src/index.ts";

const FIRST = 0;
const ONE = 1;
const LATEST_CHANGES = 2;
const DEFAULT_LIMIT = 20;
const tool = { tool: "example", version: "0.7.0" };
const change = {
	commit: "d7e55e9fb000d05b255240210a7df3694c0447df",
	summary: "Local workflow dependencies",
	body: "Use **local dependencies**.\n\n```sh\nexample inspect RUN\n```",
	breaking: ["Explicit breaking note"],
	adoption: [{ requirement: "optional" as const, text: "Rebuild the executable" }],
};
const history: ChangelogRelease[] = [
	{ version: "0.8.0", changes: [change] },
	{ version: "0.7.0", changes: [change, change] },
	{ version: "0.6.0", changes: [change] },
];

test("latest selection excludes releases beyond the installed version", () => {
	const page = queryChangelog(tool, history, { offset: 0 });
	expect(page.releases.map((release) => release.version)).toEqual(["0.7.0"]);
	expect(page.total).toBe(LATEST_CHANGES);
	expect(page.historyStartsAt).toBe("0.6.0");
});

test("exclusive since filters before paging entries within a release", () => {
	const page = queryChangelog(tool, history, { since: "0.6.0", limit: 1, offset: 0 });
	expect(page.releases).toEqual([{ version: "0.7.0", changes: [change] }]);
	expect(page).toMatchObject({ total: 2, nextOffset: 1 });
	const last = queryChangelog(tool, history, { since: "0.6.0", limit: 1, offset: 1 });
	expect(last.releases).toEqual(page.releases);
	expect(last.nextOffset).toBeUndefined();
});

test("exact selection and human rendering retain explicit breaking and adoption meaning", () => {
	const page = queryChangelog(tool, history, { release: "0.6.0", offset: 0 });
	expect(page.releases).toEqual([{ version: "0.6.0", changes: [change] }]);
	const text = renderChangelog(page);
	expect(text).toContain("(d7e55e9)");
	expect(text).toContain(change.body);
	expect(JSON.stringify(page)).toContain(JSON.stringify(change.body));
	expect(text).toContain("BREAKING: Explicit breaking note");
	expect(text).toContain("Adoption (optional): Rebuild the executable");
	expect(() => queryChangelog(tool, history, { release: "0.5.0", offset: 0 })).toThrow(Error);
});

test("large histories of empty releases stay bounded and expose exhaustion", () => {
	const empty = Array.from({ length: 140 }, (_unused, patch) => ({
		version: `0.1.${patch}`,
		changes: [],
	}));
	const page = queryChangelog(tool, empty, { since: "0.0.0", offset: 0 });
	expect(page.releases).toHaveLength(DEFAULT_LIMIT);
	expect(page).toMatchObject({ total: 140, nextOffset: 20 });
	const exhausted = queryChangelog(tool, empty, { since: "0.0.0", offset: 140 });
	expect(exhausted.releases).toEqual([]);
	expect(exhausted.nextOffset).toBeUndefined();
});

test("queries retain dates and categories across change pages and empty releases", () => {
	const categorized = { ...change, category: "fixed" as const };
	const latest = { version: "0.7.0", date: "2026-11-11", changes: [categorized, categorized] };
	const earlier = { version: "0.6.0", date: "2026-11-08", changes: [] };
	const recorded: ChangelogRelease[] = [latest, earlier];
	for (const offset of [FIRST, ONE]) {
		const page = queryChangelog(tool, recorded, { since: "0.0.0", limit: 1, offset });
		expect(page.releases).toEqual([{ ...latest, changes: [categorized] }]);
	}
	const empty = queryChangelog(tool, recorded, { since: "0.0.0", limit: 1, offset: 2 });
	expect(empty.releases).toEqual([earlier]);
});

test("text output includes recorded release dates and change categories", () => {
	const page = queryChangelog(
		tool,
		[{ version: "0.7.0", date: "2026-11-11", changes: [{ ...change, category: "fixed" }] }],
		{ release: "0.7.0", offset: 0 },
	);
	const text = renderChangelog(page);
	expect(text).toContain("0.7.0 - 2026-11-11");
	expect(text).toContain("- [fixed] Local workflow dependencies");
});
