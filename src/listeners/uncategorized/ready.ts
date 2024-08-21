import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import { ActivityType, type Client } from "discord.js";
import { version } from "../../../package.json";

@ApplyOptions<Listener.Options>({ event: "ready", once: true })
export class ReadyListener extends Listener {
	public run(client: Client) {
		client.user!.setActivity({ name: `/changelog • v${version}`, type: ActivityType.Playing });

		this.container.logger.info(`[Client Login] | Login as ${client.user!.username} | v${version}`);
	}
}
