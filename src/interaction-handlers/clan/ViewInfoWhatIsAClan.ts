import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { AccountManager, CreateResponse, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("ViewInfoWhatIsAClan_")) return this.none();
		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId] = interaction.customId.split("_");

		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This exit button is controlled by <@${userId}>. Run the command yourself to use this.`);
		if (!AccountManager.AccountExist(interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));

		return void (await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`### What is a clan?\nClans offer many benefits and access to more commands. Joining a clan means working with fellow clan members to achieve being the #1 clan.\n### Benefits\n- Extra XP/Tokens\n- Displays your clan in </profile:${await ApplicationCommandInfo(interaction.client, "profile", "id")}>\n- Access to more commands\n\n-# **PS** • You need to be at least level **5** to join a clan.`)], ephemeral: true }));
	}
}
