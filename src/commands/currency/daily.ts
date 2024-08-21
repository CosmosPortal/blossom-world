import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, AccountManager, ClanManager, Cooldown, CreateResponse, EnvData, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { DurationFormatter, Time } from "@sapphire/duration";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
	name: "daily",
	description: "Claim your daily reward"
})
export class DailyCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "daily",
			description: "Claim your daily reward"
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const cooldown = await Cooldown.CheckCooldown(`daily_${interaction.user.id}`);

		if (!(await AccountManager.AccountExist(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (cooldown > 0) return void CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(cooldown, 4, { right: ", " })}** before working another shift again.`);
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		await AccountManager.RemoveEnergyFromAccount(interaction.user.id);
		const health = await AccountManager.RemoveHealthFromAccount(interaction.user.id);
		const account = (await AccountManager.FetchAccount(interaction.user.id)) as Account;

		if (health.emptyHealth) return void (await CreateResponse.DeathInteractionError(interaction));

		await Cooldown.SetCooldown(`daily_${interaction.user.id}`, Time.Day, interaction.user.id);

		const daily = await AccountManager.ClaimDaily(interaction.user.id);
		const xp = await AccountManager.AddXpToAccount(interaction.user.id);
		if (account.Clan !== JoinableClan.None) await ClanManager.AddXpToClan(account.Clan);

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You have claimed your daily reward of ${EnvData("EMOJI_TOKEN")} **${daily.tokensEarned.toLocaleString()}**! ${daily.hasDailyStreakReset ? "Your streak was reset back to **0**!" : `Your streak is now at **${daily.dailyStreakCount}**!`} Come back in 1 day to claim again!`)], ephemeral: false });
		if (xp.hasAccountLeveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
	}
}
