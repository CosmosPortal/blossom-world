import { ActivityType } from "discord.js";
import { execute, Signal, Signals } from "sunar";
import { registerCommands } from "sunar/registry";
import { version } from "../../../package.json";

const signal = new Signal(Signals.ClientReady, { once: true });

execute(signal, async (client) => {
	await registerCommands(client.application);

	client.user.setActivity({ name: `/changelog • v${version}`, type: ActivityType.Playing });

	return void console.log(`[Client Login] | Login as ${client.user.username} | v${version}`);
});

export { signal };
