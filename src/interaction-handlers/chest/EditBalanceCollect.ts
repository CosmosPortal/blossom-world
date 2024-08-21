import { ApplicationCommandInfo, ButtonBuilder } from "@cosmosportal/utilities";
import { Account, AccountManager, CreateResponse, Currency, EnvData, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ButtonStyle, type APIEmbed, type ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class ModalHandler extends InteractionHandler {
	public override parse(interaction: ModalSubmitInteraction) {
		if (interaction.customId !== "EditBalanceCollect") return this.none();
		return this.some();
	}

	public async run(interaction: ModalSubmitInteraction) {
		if (!interaction.isFromMessage()) return;
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const amount = Number(interaction.fields.getTextInputValue("amount"));
		const account = await AccountManager.FetchAccount(interaction.user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
		if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
		if (!Number.isInteger(amount)) return void (await CreateResponse.InteractionError(interaction, "The number you entered was not an integer!"));
		if (amount > account.Currency.TokenChest) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token chest."));

		await UpdateEntity(Currency, { Snowflake: interaction.user.id }, { TokenBag: account.Currency.TokenBag + amount, TokenChest: account.Currency.TokenChest - amount });

		const reloadAccount = (await AccountManager.FetchAccount(interaction.user.id)) as Account;
		const { TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = reloadAccount.Currency;

		const embed: APIEmbed = {
			author: { name: `${interaction.user.username}'s Chest Balance` },
			color: Utility.DefaultColor(),
			fields: [{ name: `— Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `> Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\n> Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\n> Chest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\`` }]
		};

		const actionRow = new ButtonBuilder()
			.CreateRegularButton({ customId: `ViewBalanceCollect_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest === 0, label: "Collect" })
			.CreateRegularButton({ customId: `ViewBalanceStash_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest >= TokenChestStorage || TokenBag === 0, label: "Stash" })
			.BuildActionRow();

		return void (await interaction.update({ embeds: [embed], components: [actionRow] }));
	}
}
