import { ApplicationCommandInfo, ButtonBuilder, ProgressBar, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { JoinableClan } from "@lib/enums";
import { AccountManager, ClanManager, Clans, CreateResponse, Currency, EnvData, FindOrCreateEntity, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplicationCommandOptionType, ButtonStyle, type APIEmbed } from "discord.js";

@ApplyOptions<Subcommand.Options>({
	name: "clan",
	description: "View or join a clan or make a donation",
	subcommands: [
		{ name: "donate", chatInputRun: "chatInputDonate" },
		{ name: "join", chatInputRun: "chatInputJoin" },
		{ name: "view", chatInputRun: "chatInputView" }
	]
})
export class ClanCommand extends Subcommand {
	public override registerApplicationCommands(register: Subcommand.Registry) {
		register.registerChatInputCommand({
			name: "clan",
			description: "View or join a clan or make a donation",
			options: [
				{
					name: "donate",
					description: "Make a donation to your clan",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "amount",
							description: "What is the amount you are donating?",
							type: ApplicationCommandOptionType.Integer,
							min_value: 1,
							required: true
						}
					]
				},
				{
					name: "join",
					description: "Join one of the many clans out there",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "clan",
							description: "What clan will you like to join? Choose wisely!",
							type: ApplicationCommandOptionType.String,
							autocomplete: true,
							required: true
						}
					]
				},
				{
					name: "view",
					description: "View a clan's information",
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: "clan",
							description: "What clan will you like to view?",
							type: ApplicationCommandOptionType.String,
							autocomplete: true,
							required: true
						},
						{
							name: "visibility",
							description: "Should others be able to view the response?",
							type: ApplicationCommandOptionType.Boolean
						}
					]
				}
			]
		});
	}

	public async chatInputDonate(interaction: Subcommand.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const account = await AccountManager.FetchAccount(interaction.user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (account.Clan === JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are not in a clan! To join a clan, use </clan join:${interaction.commandId}>!`));

		const amount = interaction.options.getInteger("amount", true);
		const { TokenChest, TokenNetWorth } = await FindOrCreateEntity(Clans, { Clan: account.Clan });

		if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
		if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
		if (amount > account.Currency.TokenBag) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token bag."));

		await UpdateEntity(Currency, { Snowflake: interaction.user.id }, { TokenBag: account.Currency.TokenBag - amount, TokenNetWorth: account.Currency.TokenNetWorth - amount });
		await UpdateEntity(Clans, { Clan: account.Clan }, { TokenChest: TokenChest + amount, TokenNetWorth: TokenNetWorth + amount });

		const xp = await AccountManager.AddXpToAccount(interaction.user.id);
		await ClanManager.AddXpToClan(account.Clan);

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You have donated ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}** to the ${account.Clan} Clan!`)], ephemeral: false });
		if (xp.hasAccountLeveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
	}

	public async chatInputJoin(interaction: Subcommand.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const account = await AccountManager.FetchAccount(interaction.user.id);
		const name = interaction.options.getString("clan", true);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());

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

		return void (await interaction.reply({ embeds: [embed], components: [actionRowOne, actionRowTwo], ephemeral: false }));
	}

	public async chatInputView(interaction: Subcommand.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const name = interaction.options.getString("clan", true);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());

		if (!(await AccountManager.AccountExist(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "It looks like you didn't enter an existing clan name!"));

		const { CurrentXp, Level, RequiredXp, TokenChest, TokenNetWorth } = await FindOrCreateEntity(Clans, { Clan: name as Exclude<JoinableClan, JoinableClan.None> });
		const level = ProgressBar({ currentXp: CurrentXp, emptySymbol: "◇", fillSymbol: "◆", requiredXp: RequiredXp });
		const rank = await ClanManager.FetchClanLevelingRank(name as Exclude<JoinableClan, JoinableClan.None>);

		const embed: APIEmbed = {
			author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` },
			color: Utility.DefaultColor(),
			description: clanData[0].description,
			fields: [
				{ name: `— Tokens`, value: `> Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\n> Net Worth • ${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, inline: true },
				{ name: "— Level", value: `> Rank • \`#${isNaN(rank) ? "?" : rank.toLocaleString()}\`\n> Level • \`${Level.toLocaleString()}\`\n> Experience • \`${CurrentXp.toLocaleString()}/${RequiredXp.toLocaleString()}\`\n> ${level.bar} ${level.percentage}%`, inline: true }
			]
		};

		const options = ClanInformation.map((x) => ({ label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name }));
		const actionRow = new StringSelectMenuBuilder({ customId: `ViewClanInformation_${interaction.user.id}`, selectOptions: options, placeholder: "Select a clan" }).BuildActionRow();

		return void (await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
	}
}
