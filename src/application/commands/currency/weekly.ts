import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, Cooldown, CreateResponse, CurrencyManager, EnvData, FindOneEntity, Sentry, Utility } from "@lib/utils";
import { DurationFormatter, Time } from "@sapphire/duration";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "weekly",
	description: "Claim your weekly reward"
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));
	if (account.Level < 3) return void (await CreateResponse.InteractionError(interaction, `You need to be level **3** in order to use </weekly:${interaction.commandId}>!`));

	const cooldown = await Cooldown.CheckCooldown(`weekly_${interaction.user.id}`);

	if (cooldown > 0) return void CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(cooldown, 4, { right: ", " })}** before you can claim your weekly reward again.`);
	else await Cooldown.SetCooldown(`weekly_${interaction.user.id}`, Time.Week, interaction.user.id);

	const weekly = await CurrencyManager.Weekly(interaction, account);
	const xp = await CurrencyManager.ManageAccountXp(interaction, account, 2);
	if (account.Clan !== JoinableClan.None) await CurrencyManager.ManageClanXp(account.Clan);

	await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You have claimed your weekly reward of ${EnvData("EMOJI_TOKEN")} **${weekly.earned}**! Come back in 1 week to claim again!`)], ephemeral: false });
	await Utility.Wait(300);
	if (xp.leveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
});

export { slash };
