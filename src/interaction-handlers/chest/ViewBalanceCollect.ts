import { ApplicationCommandInfo, ModalBuilder } from "@cosmosportal/utilities";
import { AccountManager, CreateResponse, Sentry } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { TextInputStyle, type ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("ViewBalanceCollect_")) return this.none();
		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId] = interaction.customId.split("_");
		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This collect button is controlled by <@${userId}>. Run the command yourself to use this.`);

		const account = await AccountManager.FetchAccount(interaction.user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		const { TokenChest } = account.Currency;

		const modal = new ModalBuilder({ customId: "EditBalanceCollect", title: "Chest Manager" })
			.CreateTextInput({
				customId: "amount",
				label: "Enter the amount of tokens you are collecting",
				style: TextInputStyle.Short,
				maxLength: String(TokenChest).length,
				placeholder: `You can take out ${TokenChest.toLocaleString()}!`,
				required: true,
				value: String(TokenChest)
			})
			.BuildResponse();

		return void (await interaction.showModal(modal));
	}
}
