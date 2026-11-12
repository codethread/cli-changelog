import { changelogChangeSchema, changelogReleaseSchema, changelogSchema } from "../src/index.ts";
import { expect, test } from "bun:test";

const change = {
	commit: "abcdef0",
	summary: "Example change",
	body: "",
	breaking: [],
	adoption: [],
};
const categories = ["added", "changed", "deprecated", "removed", "fixed", "security"] as const;

test("release dates and change categories are optional recorded metadata", () => {
	expect(changelogReleaseSchema.parse({ version: "1.0.0", changes: [change] })).toEqual({
		version: "1.0.0",
		changes: [change],
	});
	for (const category of categories) {
		const release = {
			version: "1.0.0",
			date: "2024-02-29",
			changes: [{ ...change, category }],
		};
		expect(changelogReleaseSchema.parse(release)).toEqual(release);
	}
});

test("dates must be real calendar dates in YYYY-MM-DD format", () => {
	for (const date of [
		"2025-02-29",
		"2024-02-30",
		"2026-13-01",
		"2026-04-31",
		"2026-1-01",
		"2026-01-01T00:00:00Z",
		"",
		// eslint-disable-next-line unicorn/no-null -- JSON null must fail, unlike an omitted date.
		null,
	]) {
		expect(changelogReleaseSchema.safeParse({ version: "1.0.0", date, changes: [] }).success).toBe(
			false,
		);
	}
});

test("unknown and incorrectly typed categories fail validation", () => {
	// eslint-disable-next-line unicorn/no-null -- JSON null must fail, unlike an omitted category.
	for (const category of ["Added", "feature", "", null, ["added"]]) {
		expect(changelogChangeSchema.safeParse({ ...change, category }).success).toBe(false);
	}
});

test("response JSON Schema exposes dates and categories without requiring them", () => {
	expect(changelogSchema()).toMatchObject({
		properties: {
			releases: {
				items: {
					required: ["version", "changes"],
					properties: {
						date: { type: "string", format: "date" },
						changes: {
							items: {
								required: ["commit", "summary", "body", "breaking", "adoption"],
								properties: { category: { type: "string", enum: categories } },
							},
						},
					},
				},
			},
		},
	});
});
