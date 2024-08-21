import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { Account, AccountManager, Attributes, CreateEntity, CreateResponse, Currency, Inventory, Levels, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplicationCommandOptionType } from "discord.js";

@ApplyOptions<Subcommand.Options>({
	name: "account",
	description: "Provides information about Blossom World",
	subcommands: [{ name: "register", chatInputRun: "chatInputRegister" }]
})
export class AccountCommand extends Subcommand {
	public override registerApplicationCommands(register: Subcommand.Registry) {
		register.registerChatInputCommand({
			name: "account",
			description: "Manage your Blossom World account",
			options: [
				{
					name: "register",
					description: "Register an account on Blossom World",
					type: ApplicationCommandOptionType.Subcommand
				}
			]
		});
	}

	public async chatInputRegister(interaction: Subcommand.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		if (await AccountManager.AccountExist(interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you already have an account! Use </profile:${await ApplicationCommandInfo(interaction.client, "profile", "id")}> to view your global profile!`));

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! Please wait as I register your account.\n┖ **Progress** • Beginning your adventure`)], ephemeral: true });

		const attributes = await CreateEntity(Attributes, { Snowflake: interaction.user.id });

		await interaction.editReply({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! Please wait as I register your account.\n┖ **Progress** • Managing your tokens`)] });

		const currency = await CreateEntity(Currency, { Snowflake: interaction.user.id });

		await interaction.editReply({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! Please wait as I register your account.\n┖ **Progress** • Buying an inventory bag`)] });

		const inventory = await CreateEntity(Inventory, { Snowflake: interaction.user.id });

		await interaction.editReply({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! Please wait as I register your account.\n┖ **Progress** • Joining the global leveling system`)] });

		const levels = await CreateEntity(Levels, { Snowflake: interaction.user.id });

		await interaction.editReply({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! Please wait as I register your account.\n┖ **Progress** • Registering your account`)] });

		const { CreationTimestamp } = await CreateEntity(Account, { Snowflake: interaction.user.id, Attributes: attributes, Currency: currency, Inventory: inventory, Levels: levels });

		return void (await interaction.editReply({ embeds: [Utility.CreateSimpleEmbed(`I have successfully created your account on <t:${Math.trunc(Math.floor(CreationTimestamp.getTime() / 1000))}:D>! You can use </profile:${await ApplicationCommandInfo(interaction.client, "profile", "id")}> to view your account. Good luck with your journey!`)] }));
	}
}
