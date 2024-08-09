import { ButtonBuilder } from "@cosmosportal/utilities";
import { Account, CreateResponse, EnvData, FindOneEntity, Sentry, Utility } from "@lib/utils";
import { ApplicationCommandOptionType, ButtonStyle, type APIEmbed } from "discord.js";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "chest",
	description: "View your chest balance or someone else",
	options: [
		{
			name: "user",
			description: "Whose profile would you like to view?",
			type: ApplicationCommandOptionType.User
		},
		{
			name: "visibility",
			description: "Should others be able to view the response?",
			type: ApplicationCommandOptionType.Boolean
		}
	]
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const user = interaction.options.getUser("user", false) || interaction.user;
	const account = await FindOneEntity(Account, { Snowflake: user.id });

	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like **@${user.tag}** doesn't have an account registered!`));

	const { TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = account;

	const embed: APIEmbed = {
		author: { name: `@${user.tag}'s Chest Balance` },
		color: Utility.DefaultColor(),
		fields: [{ name: `Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\nChest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\nChest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\``, inline: true }]
	};

	const actionRow = new ButtonBuilder()
		.CreateRegularButton({ customId: `ViewBalanceCollect_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest === 0, label: "Collect" })
		.CreateRegularButton({ customId: `ViewBalanceStash_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest >= TokenChestStorage || TokenBag === 0, label: "Stash" })
		.BuildActionRow();

	return void (await interaction.reply({ embeds: [embed], components: interaction.user.id === user.id ? [actionRow] : [], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
});

export { slash };
