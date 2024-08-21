import { ApplicationCommandInfo, ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { AccountManager, CreateResponse, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { JoinableClan } from "@lib/enums";
import { ButtonStyle, type APIEmbed, type StringSelectMenuInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class SelectMenuHandler extends InteractionHandler {
	public override parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith("ViewJoinableClan_")) return this.none();
		return this.some();
	}

	public async run(interaction: StringSelectMenuInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId] = interaction.customId.split("_");
		const account = await AccountManager.FetchAccount(interaction.user.id);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === interaction.values[0].toLowerCase());

		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This exit button is controlled by <@${userId}>. Run the command yourself to use this.`);
		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (account.Clan !== JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are already in a clan! You are currently in the ${account.Clan} clan!`));
		if (account.Levels.Level < 5) return void (await CreateResponse.InteractionError(interaction, "You need to be level **5** in order to join a clan!"));
		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "It looks like you didn't enter an existing clan name!"));

		const embed: APIEmbed = { author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` }, color: Utility.DefaultColor(), description: clanData[0].description };

		const actionRowOne = new ButtonBuilder()
			.CreateRegularButton({ customId: `EditAccountJoinClan_${interaction.user.id}_${clanData[0].name}`, style: ButtonStyle.Primary, label: `Join the ${clanData[0].primaryName}` })
			.CreateRegularButton({ customId: `ViewInfoWhatIsAClan_${interaction.user.id}`, style: ButtonStyle.Secondary, label: "What is this?" })
			.CreateRegularButton({ customId: `ExitClanJoin_${interaction.user.id}`, style: ButtonStyle.Danger, label: "Exit" })
			.BuildActionRow();

		const options = ClanInformation.map((x) => ({ label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name }));
		const actionRowTwo = new StringSelectMenuBuilder({ customId: `ViewJoinableClan_${interaction.user.id}`, selectOptions: options, placeholder: "Select a clan" }).BuildActionRow();

		return void (await interaction.update({ embeds: [embed], components: [actionRowOne, actionRowTwo] }));
	}
}
