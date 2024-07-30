import { CreateResponse, Sentry, Utility } from "#lib/utils";
import { EmbedBuilder } from "discord.js";
import { config, CooldownScope, execute, Slash } from "sunar";
import { dependencies, devDependencies, version } from "../../../../package.json";

const slash = new Slash({
	name: "about",
	description: "Provides information about Starlight Bank"
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const memberCount = interaction.client.guilds.cache.reduce((user, guild) => user + guild.memberCount, 0);

	const embed = new EmbedBuilder()
		.setThumbnail(interaction.client.user.avatarURL({ forceStatic: false, size: 4096 }))
		.setDescription(`Cosmos Portal presents to you ${interaction.client.user.username}, an economy Discord application for Starlight Café.\n### ${interaction.client.user.username} Information\n- **Member Count** • ${memberCount.toLocaleString()}\n- **Ping** • ${interaction.client.ws.ping}ms\n- **Uptime** • Online since <t:${Math.trunc(Math.floor((Date.now() - interaction.client.uptime) / 1000))}:D>\n### Version\n- **${interaction.client.user.username}** • v${version}\n- **@CosmosPortal/Utilities** • v${dependencies["@cosmosportal/utilities"].replace(/^\^/g, "")}\n- **Discord.JS** • v${dependencies["discord.js"].replace(/^\^/g, "")}\n- **TypeScript** • v${devDependencies["typescript"].replace(/^\^/g, "")}`)
		.setColor(Utility.DefaultColor());

	return void (await interaction.reply({ embeds: [embed], ephemeral: true }));
});

export { slash };
