import agents, { mailExtensions } from "./src/agents.ts";
import batteriesExtension from "@botlake/extension-batteries";
import { createLake } from "@botlake/core";
import flags from "./src/flags.ts";
import identityExtension from "@botlake/extension-identity";
import priming from "./src/priming.ts";
import references from "./src/references.ts";
import ui from "./src/ui.ts";
import work from "./src/work.ts";
import workAgents from "./src/work-agents.ts";

export const lake = createLake({
	name: "cli-changelog",
	extensions: [
		batteriesExtension,
		identityExtension,
		flags,
		references,
		agents,
		...mailExtensions,
		priming,
		ui,
		work,
		workAgents,
	],
});
