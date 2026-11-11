import {
	changelogHistorySchema,
	changelogQuerySchema,
	changelogSchema,
	queryChangelog,
} from "../src/index.ts";
import { expect, test } from "bun:test";
import history from "../changelog.json";
import manifest from "../package.json";

const SUCCESS = 0;
const cli = Bun.fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const tool = { tool: "cli-changelog", version: manifest.version };
const releases = changelogHistorySchema.parse(history);

async function run(
	...args: string[]
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
	const child = Bun.spawn({
		cmd: [process.execPath, cli, ...args],
		cwd: "/tmp",
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
	]);
	return { exitCode, stdout, stderr };
}

test("CLI queries its packaged history using the library", async () => {
	expect(releases.some((release) => release.version === manifest.version)).toBe(true);
	const result = await run("changelog", "--json");
	const expected = queryChangelog(tool, releases, { offset: 0 });
	expect(result.exitCode).toBe(SUCCESS);
	expect(result.stdout).toBe(`${JSON.stringify(expected)}\n`);
	const text = await run("changelog");
	expect(text.exitCode).toBe(SUCCESS);
	expect(text.stdout).toContain(`cli-changelog changelog (installed ${manifest.version})`);
	expect(text.stdout).toContain(manifest.version);
});

test("CLI supports release selection and paginated since queries", async () => {
	for (const [args, query] of [
		[["--release", "0.1.0"], { release: "0.1.0" }],
		[
			["--since", "0.0.0", "--limit", "1", "--offset", "1"],
			{ since: "0.0.0", limit: 1, offset: 1 },
		],
	] as const) {
		// eslint-disable-next-line no-await-in-loop -- Bound concurrent test subprocesses.
		const result = await run("changelog", "--json", ...args);
		const expected = queryChangelog(tool, releases, changelogQuerySchema.parse(query));
		expect(result.exitCode).toBe(SUCCESS);
		expect(result.stdout).toBe(`${JSON.stringify(expected)}\n`);
	}
});

test("CLI exposes the library response schema and help", async () => {
	const schema = await run("changelog", "--schema");
	expect(schema.exitCode).toBe(SUCCESS);
	expect(schema.stdout).toBe(`${JSON.stringify(changelogSchema())}\n`);
	const help = await run("--help");
	expect(help.exitCode).toBe(SUCCESS);
	expect(help.stdout).toContain("cli-changelog changelog");
});

test("CLI rejects invalid commands, options, queries and missing releases", async () => {
	for (const args of [
		[],
		["unknown"],
		["changelog", "extra"],
		["changelog", "--unknown"],
		["changelog", "--since", "0.1.0", "--release", "0.1.0"],
		["changelog", "--limit", "0"],
		["changelog", "--offset", "-1"],
		["changelog", "--release", "invalid"],
		["changelog", "--release", "9.9.9"],
	]) {
		// eslint-disable-next-line no-await-in-loop -- Bound concurrent test subprocesses.
		const result = await run(...args);
		expect(result.exitCode).not.toBe(SUCCESS);
		expect(result.stderr).not.toBe("");
		expect(result.stdout).toBe("");
	}
});
