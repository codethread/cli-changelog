import { expect, test } from "bun:test";

const lakeSource = await Bun.file(new URL("../.botlake/lake.ts", import.meta.url)).text();
const agentsSource = await Bun.file(new URL("../.botlake/src/agents.ts", import.meta.url)).text();
const mailSource = await Bun.file(new URL("../.botlake/src/mail.ts", import.meta.url)).text();

test("the lake selects all preset Mail integrations with preset Agents", () => {
	expect(lakeSource).toContain("import agents, { mailExtensions }");
	expect(lakeSource).toMatch(/\n\s+agents,\n\s+\.\.\.mailExtensions,/u);
	expect(agentsSource).toContain(
		'export { agents as default } from "@botlake/extension-ct-config"',
	);
	expect(mailSource).toContain("mail,");
	expect(mailSource).toContain("mailIdentity,");
	expect(mailSource).toContain("mailAgents,");
	expect(mailSource).toContain("export const mailExtensions = [mail, mailIdentity, mailAgents]");
});
