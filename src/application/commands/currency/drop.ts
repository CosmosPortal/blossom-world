import { ApplicationCommandInfo, ButtonBuilder } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, CreateResponse, CurrencyManager, EnvData, FindOneEntity, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplicationCommandOptionType, ButtonStyle } from "discord.js";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
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

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const amount = interaction.options.getInteger("amount", true);

	if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
	if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
	if (amount > account.TokenBag) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token bag."));

	await UpdateEntity(Account, { Snowflake: interaction.user.id }, { TokenBag: account.TokenBag - amount, TokenNetWorth: account.TokenNetWorth - amount });

	const xp = await CurrencyManager.ManageAccountXp(interaction, account);
	if (account.Clan !== JoinableClan.None) await CurrencyManager.ManageClanXp(account.Clan);

	const actionRow = new ButtonBuilder().CreateRegularButton({ custom_id: `EditBalanceCollectUserDrop_${amount}`, style: ButtonStyle.Secondary, label: "Collect" }).BuildActionRow();

	await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`It looks like **@${interaction.user.tag}** dropped ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}** on the floor! Be the first to collect it!`)], components: [actionRow], ephemeral: false });
	await Utility.Wait(300);
	if (xp.leveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
});

export { slash };
