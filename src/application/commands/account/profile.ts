import { JoinableClan } from "@lib/enums";
import { Account, CreateResponse, EnvData, FindOneEntity, Leaderboard, ProgressBar, Sentry, Utility } from "@lib/utils";
import { ApplicationCommandOptionType, type APIEmbed } from "discord.js";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "profile",
	description: "View your profile or someone else",
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

	const { Clan, CurrentXp, Level, RequiredXp, TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = account;
	const rank = await Leaderboard.AccountLevelRank(account);
	const progressBarData = ProgressBar({ currentXp: CurrentXp, requiredXp: RequiredXp });

	const embed: APIEmbed = {
		author: { name: `@${user.tag}${Clan !== JoinableClan.None ? `┃Clan of ${Clan}` : ""}` },
		color: Utility.DefaultColor(),
		fields: [
			{ name: `Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\nChest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\nChest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\``, inline: true },
			{ name: "_ _", value: "_ _", inline: true },
			{ name: "Level", value: `Rank • \`#${isNaN(rank) ? "?" : rank.toLocaleString()}\`\nLevel • \`${Level.toLocaleString()}\`\nExperience • \`${CurrentXp.toLocaleString()}/${RequiredXp.toLocaleString()}\`\n\`${progressBarData.bar}\` ${progressBarData.percentage}%`, inline: true }
		]
	};

	return void (await interaction.reply({ embeds: [embed], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
});

export { slash };
