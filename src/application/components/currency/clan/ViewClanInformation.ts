import { ApplicationCommandInfo, ProgressBar, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { Account, Clans, CreateResponse, EnvData, FindOneEntity, FindOrCreateEntity, Leaderboard, Sentry, Utility } from "@lib/utils";
import { ComponentType, type APIEmbed } from "discord.js";
import { config, CooldownScope, execute, SelectMenu } from "sunar";
import type { JoinableClan } from "@lib/enums";

const selectMenu = new SelectMenu({ id: /^ViewClanInformation_.+$/, type: ComponentType.StringSelect });

config(selectMenu, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(selectMenu, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, userId] = interaction.customId.split("_");
	if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This clan search menu is controlled by <@${userId}>. Run the command yourself to use this.`);

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === interaction.values[0].toLowerCase());
	if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "I couldn't find the clan information!"));

	const clan = await FindOrCreateEntity(Clans, { Clan: interaction.values[0] as Exclude<JoinableClan, JoinableClan.None> });
	const { CurrentXp, Level, RequiredXp, TokenChest, TokenNetWorth } = clan;
	const progressBarData = ProgressBar({ currentXp: CurrentXp, requiredXp: RequiredXp });
	const rank = await Leaderboard.ClanLevelRank(clan);

	const embed: APIEmbed = {
		author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` },
		color: Utility.DefaultColor(),
		description: clanData[0].description,
		fields: [
			{ name: `Tokens`, value: `Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\nNet Worth • ${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, inline: true },
			{ name: "_ _", value: "_ _", inline: true },
			{ name: "Level", value: `Rank • \`#${isNaN(rank) ? "?" : rank.toLocaleString()}\`\nLevel • \`${Level.toLocaleString()}\`\nExperience • \`${CurrentXp.toLocaleString()}/${RequiredXp.toLocaleString()}\`\n\`${progressBarData.bar}\` ${progressBarData.percentage}%`, inline: true }
		]
	};

	const options = ClanInformation.map((x) => {
		return { label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name };
	});

	const actionRow = new StringSelectMenuBuilder({ customId: `ViewClanInformation_${interaction.user.id}`, selectOptions: options, placeholder: "Select a clan" }).BuildActionRow();

	return void (await interaction.update({ embeds: [embed], components: [actionRow] }));
});

export { selectMenu };
