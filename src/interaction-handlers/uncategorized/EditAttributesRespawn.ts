import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { AccountManager, Attributes, CreateResponse, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("EditAttributesRespawn_")) return this.none();
		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId] = interaction.customId.split("_");

		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This respawn button is controlled by <@${userId}>. Run the command yourself to use this.`);
		if (!AccountManager.AccountExist(interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (!AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you already respawned!`));

		await interaction.deferUpdate();

		await interaction.deleteReply().catch(() => undefined);

		await UpdateEntity(Attributes, { Snowflake: interaction.user.id }, { Energy: 50, Health: 100 });

		return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`You have successfully been respawned! Your token bag was unfortunately reset to zero.`)], ephemeral: true }));
	}
}
