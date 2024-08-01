import { Clan } from "#lib/enums";
import { Account, Cooldown, CreateResponse, EconomyManager, FindOneEntity, Sentry, Utility } from "#lib/utils";
import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { DurationFormatter, Time } from "@sapphire/duration";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "work",
	description: "Work a shift at your job for a paycheck"
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const cooldown = await Cooldown.CheckCooldown(`work_${interaction.user.id}`);

	if (cooldown > 0) return void CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(cooldown, 4, { right: ", " })}** before working another shift again.`);
	else await Cooldown.SetCooldown(`work_${interaction.user.id}`, Time.Hour, interaction.user.id);

	const work = await EconomyManager.Work(interaction, account);
	const xp = await EconomyManager.ManageAccountXp(interaction, account);
	if (account.Clan !== Clan.None) await EconomyManager.ManageClanXp(account.Clan);

	await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You worked long hours ${work.overtime === 1 ? "with overtime " : ""}and earned **$${work.earned}** for your paycheck! Come back in 1 hour to work another shift!`)], ephemeral: false });
	await Utility.Wait(300);
	if (xp.leveledUp) return await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.tag}**! You just advanced to level **${xp.level}**!`)], ephemeral: true });
});

export { slash };