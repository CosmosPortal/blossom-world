import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { AccountManager, CreateResponse, Currency, EnvData, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Time } from "@sapphire/duration";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { setTimeout } from "node:timers/promises";
import type { ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("EditBalanceCollectUserDrop_")) return this.none();
		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, number] = interaction.customId.split("_");
		const amount = Number(number);
		const account = await AccountManager.FetchAccount(interaction.user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		await UpdateEntity(Currency, { Snowflake: interaction.user.id }, { TokenBag: account.Currency.TokenBag + amount, TokenNetWorth: account.Currency.TokenNetWorth + amount });
		await interaction.update({ embeds: [Utility.CreateSimpleEmbed(`**@${interaction.user.username}** collected the ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}**!`)], components: [] });
		await setTimeout(Time.Second * 5);
		return void (await interaction.deleteReply().catch(() => undefined));
	}
}
