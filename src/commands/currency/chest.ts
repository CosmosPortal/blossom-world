import { ApplicationCommandInfo, ButtonBuilder } from "@cosmosportal/utilities";
import { AccountManager, CreateResponse, EnvData, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { ApplicationCommandOptionType, ButtonStyle, type APIEmbed } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "chest",
	description: "View your chest balance or someone else",
	options: ["user", "visibility"]
})
export class ChestCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "chest",
			description: "View your chest balance or someone else",
			options: [
				{
					name: "user",
					description: "Whose chest would you like to view?",
					type: ApplicationCommandOptionType.User
				},
				{
					name: "visibility",
					description: "Should others be able to view the response?",
					type: ApplicationCommandOptionType.Boolean
				}
			]
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const user = interaction.options.getUser("user", false) || interaction.user;
		const account = await AccountManager.FetchAccount(user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `It looks like **@${user.username}** doesn't have an account registered! Ask them to use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		const { TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = account.Currency;

		const embed: APIEmbed = {
			author: { name: `${user.username}'s Chest Balance` },
			color: Utility.DefaultColor(),
			fields: [{ name: `— Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `> Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\n> Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\n> Chest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\`` }]
		};

		const actionRow = new ButtonBuilder()
			.CreateRegularButton({ customId: `ViewBalanceCollect_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest === 0, label: "Collect" })
			.CreateRegularButton({ customId: `ViewBalanceStash_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest >= TokenChestStorage || TokenBag === 0, label: "Stash" })
			.BuildActionRow();

		return void (await interaction.reply({ embeds: [embed], components: interaction.user.id === user.id ? [actionRow] : [], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
	}
}
