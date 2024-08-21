import { CreateResponse, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { dependencies, devDependencies, version } from "../../../package.json";
import type { APIEmbed } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "about",
	description: "Provides information about Blossom World"
})
export class AboutCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "about",
			description: "Provides information about Blossom World"
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const memberCount = interaction.client.guilds.cache.reduce((user, guild) => user + guild.memberCount, 0);

		const embed: APIEmbed = {
			color: Utility.DefaultColor(),
			description: `Cosmos Portal presents to you ${interaction.client.user.username}, a currency Discord application for Starlight Café.\n### ${interaction.client.user.username} Information\n- **Member Count** • ${memberCount.toLocaleString()}\n- **Ping** • ${interaction.client.ws.ping}ms\n- **Uptime** • Online since <t:${Math.trunc(Math.floor((Date.now() - interaction.client.uptime) / 1000))}:D>\n### Version\n- **${interaction.client.user.username}** • v${version}\n- **@CosmosPortal/Utilities** • v${dependencies["@cosmosportal/utilities"].replace(/^\^/g, "")}\n- **Discord.JS** • v${dependencies["discord.js"].replace(/^\^/g, "")}\n- **TypeScript** • v${devDependencies["typescript"].replace(/^\^/g, "")}`,
			thumbnail: { url: interaction.client.user.displayAvatarURL({ forceStatic: false, size: 4096 }) }
		};

		return void (await interaction.reply({ embeds: [embed], ephemeral: true }));
	}
}
