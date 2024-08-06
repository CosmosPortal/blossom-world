import { ApplicationCommandInfo, ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { JoinableClan } from "@lib/enums";
import { Account, CreateResponse, FindOneEntity, Sentry, Utility } from "@lib/utils";
import { ButtonStyle, ComponentType, type APIEmbed } from "discord.js";
import { config, CooldownScope, execute, SelectMenu } from "sunar";

const selectMenu = new SelectMenu({ id: /^ViewJoinableClan_.+$/, type: ComponentType.StringSelect });

config(selectMenu, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(selectMenu, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, userId] = interaction.customId.split("_");
	if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This clan search menu is controlled by <@${userId}>. Run the command yourself to use this.`);

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));
	if (account.Clan !== JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are already in a clan! You are currently in the ${account.Clan} clan!`));
	if (account.Level < 5) return void (await CreateResponse.InteractionError(interaction, "You need to be level **5** in order to join a clan!"));

	const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === interaction.values[0].toLowerCase());
	if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "I couldn't find the clan information!"));

	const embed: APIEmbed = { author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` }, color: Utility.DefaultColor(), description: clanData[0].description };

	const actionRowOne = new ButtonBuilder()
		.CreateRegularButton({ custom_id: `EditAccountJoinClan_${interaction.user.id}_${clanData[0].name}`, style: ButtonStyle.Primary, label: `Join the ${clanData[0].primaryName}` })
		.CreateRegularButton({ custom_id: `ViewInfoWhatIsAClan_${interaction.user.id}`, style: ButtonStyle.Secondary, label: "What is this?" })
		.CreateRegularButton({ custom_id: `ExitClanJoin_${interaction.user.id}`, style: ButtonStyle.Danger, label: "Exit" })
		.BuildActionRow();

	const options = ClanInformation.map((x) => {
		return { label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name };
	});

	const actionRowTwo = new StringSelectMenuBuilder({ custom_id: `ViewJoinableClan_${interaction.user.id}`, select_options: options, placeholder: "Select a clan" }).BuildActionRow();

	return void (await interaction.update({ embeds: [embed], components: [actionRowOne, actionRowTwo] }));
});

export { selectMenu };
