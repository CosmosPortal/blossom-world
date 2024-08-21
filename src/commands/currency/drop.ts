import { ApplicationCommandInfo, ButtonBuilder } from "@cosmosportal/utilities";
import { Account, AccountManager, Cooldown, CreateResponse, Currency, EnvData, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Time } from "@sapphire/duration";
import { Command } from "@sapphire/framework";
import { ApplicationCommandOptionType, ButtonStyle } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "drop",
	description: "Drop tokens for someone to claim",
	options: ["amount"]
})
export class DailyCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "drop",
			description: "Drop tokens for someone to claim",
			options: [
				{
					name: "amount",
					description: "What is the amount you are dropping?",
					type: ApplicationCommandOptionType.Integer,
					min_value: 1,
					required: true
				}
			]
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		if (!(await AccountManager.AccountExist(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		const account = (await AccountManager.FetchAccount(interaction.user.id)) as Account;
		const amount = interaction.options.getInteger("amount", true);

		if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
		if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
		if (amount > account.Currency.TokenBag) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token bag."));

		await UpdateEntity(Currency, { Snowflake: interaction.user.id }, { TokenBag: account.Currency.TokenBag - amount, TokenNetWorth: account.Currency.TokenNetWorth - amount });

		const actionRow = new ButtonBuilder().CreateRegularButton({ customId: `EditBalanceCollectUserDrop_${amount}`, style: ButtonStyle.Secondary, label: "Collect" }).BuildActionRow();

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`It looks like **@${interaction.user.username}** dropped ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}** on the floor! Be the first to collect it!`)], components: [actionRow], ephemeral: false });

		const cooldown = await Cooldown.CheckCooldown(`dropXpEarning_${interaction.user.id}`);
		if (cooldown > 0) return;

		await Cooldown.SetCooldown(`dropXpEarning_${interaction.user.id}`, Time.Minute * 30, interaction.user.id);

		const xp = await AccountManager.AddXpToAccount(interaction.user.id);
		if (xp.hasAccountLeveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
	}
}
