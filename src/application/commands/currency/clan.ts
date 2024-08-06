import { ApplicationCommandInfo, ButtonBuilder, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { JoinableClan } from "@lib/enums";
import { Account, Clans, CreateResponse, CurrencyManager, EnvData, FindOneEntity, FindOrCreateEntity, Leaderboard, ProgressBar, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplicationCommandOptionType, ButtonStyle, type APIEmbed } from "discord.js";
import { Autocomplete, config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "clan",
	description: "view or join a clan or make a donation",
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

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	if (interaction.options.getSubcommand() === "donate") {
		if (account.Clan === JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are not in a clan! To join a clan, use </clan join:${interaction.commandId}>!`));

		const amount = interaction.options.getInteger("amount", true);
		const { TokenChest, TokenNetWorth } = await FindOrCreateEntity(Clans, { Clan: account.Clan });

		if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
		if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
		if (amount > account.TokenBag) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token bag."));

		await UpdateEntity(Account, { Snowflake: interaction.user.id }, { TokenBag: account.TokenBag - amount, TokenNetWorth: account.TokenNetWorth - amount });
		await UpdateEntity(Clans, { Clan: account.Clan }, { TokenChest: TokenChest + amount, TokenNetWorth: TokenNetWorth + amount });

		const xp = await CurrencyManager.ManageAccountXp(interaction, account);
		await CurrencyManager.ManageClanXp(account.Clan);

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You have donated ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}** to the ${account.Clan} Clan!`)], ephemeral: false });
		await Utility.Wait(300);
		if (xp.leveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
	}

	if (interaction.options.getSubcommand() === "join") {
		if (account.Clan !== JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are already in a clan! You are currently in the ${account.Clan} clan!`));
		if (account.Level < 5) return void (await CreateResponse.InteractionError(interaction, "You need to be level **5** in order to join a clan!"));

		const name = interaction.options.getString("clan", true);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());

		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "You didn't enter an existing clan name!"));

		const embed: APIEmbed = { author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` }, color: Utility.DefaultColor(), description: clanData[0].description };

		const actionRowOne = new ButtonBuilder()
			.CreateRegularButton({ custom_id: `EditAccountJoinClan_${interaction.user.id}_${clanData[0].name}`, style: ButtonStyle.Primary, label: `Join the ${clanData[0].primaryName}` })
			.CreateRegularButton({ custom_id: `ViewInfoWhatIsAClan_${interaction.user.id}`, style: ButtonStyle.Secondary, label: "What is this?" })
			.CreateRegularButton({ custom_id: `ExitClanJoin_${interaction.user.id}`, style: ButtonStyle.Danger, label: "Exit" })
			.BuildActionRow();

		const options = ClanInformation.map((x) => {
			return { label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name };
		});

		const actionRowTwo = new StringSelectMenuBuilder({ custom_id: `ViewJoinableClan_${interaction.user.id}`, select_options: options, placeholder: "Select a clan" }).BuildActionRow();

		return void (await interaction.reply({ embeds: [embed], components: [actionRowOne, actionRowTwo], ephemeral: false }));
	}

	if (interaction.options.getSubcommand() === "view") {
		const name = interaction.options.getString("clan", true);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());

		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "You didn't enter an existing clan name!"));

		const clan = await FindOrCreateEntity(Clans, { Clan: name as Exclude<JoinableClan, JoinableClan.None> });
		const { CurrentXp, Level, RequiredXp, TokenChest, TokenNetWorth } = clan;
		const progressBarData = ProgressBar({ currentXp: CurrentXp, requiredXp: RequiredXp });
		const rank = await Leaderboard.ClanLevelRank(clan);

		const embed: APIEmbed = {
			author: { name: `The ${clanData[0].primaryName}┃Clan Leader • ${clanData[0].leader}` },
			color: Utility.DefaultColor(),
			description: clanData[0].description,
			fields: [
				{ name: `Tokens`, value: `Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\nNet Worth • ${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, inline: true },
				{ name: "_ _", value: "_ _", inline: true },
				{ name: "Level", value: `Rank • \`#${isNaN(rank) ? "?" : rank.toLocaleString()}\`\nLevel • \`${Level.toLocaleString()}\`\nExperience • \`${CurrentXp.toLocaleString()}/${RequiredXp.toLocaleString()}\`\n\`${progressBarData.bar}\` ${progressBarData.percentage}%`, inline: true }
			]
		};

		const options = ClanInformation.map((x) => {
			return { label: `The ${x.primaryName}`, value: x.name, default: clanData[0].name === x.name };
		});

		const actionRow = new StringSelectMenuBuilder({ custom_id: `ViewClanInformation_${interaction.user.id}`, select_options: options, placeholder: "Select a clan" }).BuildActionRow();

		return void (await interaction.followUp({ embeds: [embed], components: [actionRow], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
	}
});

const autocomplete = new Autocomplete({
	name: "clan",
	commandName: /^(clan)$/
});

execute(autocomplete, async (interaction, option) => {
	const focused = interaction.options.getFocused();
	const choices = ClanInformation.filter((x) => x.id.includes(focused) || x.leader.toLowerCase().includes(focused.toLowerCase()) || x.name.toLowerCase().includes(focused.toLowerCase()) || x.primaryName.toLowerCase().includes(focused.toLowerCase()) || `The ${x.primaryName}`.toLowerCase().includes(focused.toLowerCase()));
	const data = choices.map((x) => {
		return { name: `The ${x.primaryName}`, value: x.name };
	});

	return void (await interaction.respond(data.slice(0, 25)).catch(() => {}));
});

export { autocomplete, slash };
