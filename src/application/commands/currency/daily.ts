import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, Cooldown, CreateResponse, CurrencyManager, EnvData, FindOneEntity, Sentry, Utility } from "@lib/utils";
import { DurationFormatter, Time } from "@sapphire/duration";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "daily",
	description: "Claim your daily reward"
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const cooldown = await Cooldown.CheckCooldown(`daily_${interaction.user.id}`);

	if (cooldown > 0) return void CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(cooldown, 4, { right: ", " })}** before you can claim your daily reward again.`);
	else await Cooldown.SetCooldown(`daily_${interaction.user.id}`, Time.Day, interaction.user.id);

	const daily = await CurrencyManager.Daily(interaction, account);
	const xp = await CurrencyManager.ManageAccountXp(interaction, account);
	if (account.Clan !== JoinableClan.None) await CurrencyManager.ManageClanXp(account.Clan);

	await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You have claimed your daily reward of ${EnvData("EMOJI_TOKEN")} **${daily.earned.toLocaleString()}**! ${daily.resetStreak ? "Your streak was reset back to **0**!" : `Your streak is now at **${daily.dailyStreak}**!`} Come back in 1 day to claim again!`)], ephemeral: false });
	await Utility.Wait(300);
	if (xp.leveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
});

export { slash };