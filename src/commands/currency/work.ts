import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, AccountManager, ClanManager, Cooldown, CreateResponse, EnvData, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { DurationFormatter, Time } from "@sapphire/duration";
import { Command } from "@sapphire/framework";

@ApplyOptions<Command.Options>({
	name: "work",
	description: "Work a shift at your job"
})
export class WorkCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "work",
			description: "Work a shift at your job"
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const cooldown = await Cooldown.CheckCooldown(`work_${interaction.user.id}`);

		if (!(await AccountManager.AccountExist(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (cooldown > 0) return void CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(cooldown, 4, { right: ", " })}** before working another shift again.`);
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));

		await AccountManager.RemoveEnergyFromAccount(interaction.user.id);
		const health = await AccountManager.RemoveHealthFromAccount(interaction.user.id);
		const account = (await AccountManager.FetchAccount(interaction.user.id)) as Account;

		if (health.emptyHealth) return void (await CreateResponse.DeathInteractionError(interaction));

		await Cooldown.SetCooldown(`work_${interaction.user.id}`, Time.Hour, interaction.user.id);

		const work = await AccountManager.WorkShift(interaction.user.id);
		const xp = await AccountManager.AddXpToAccount(interaction.user.id);
		if (account.Clan !== JoinableClan.None) await ClanManager.AddXpToClan(account.Clan);

		await interaction.reply({ embeds: [Utility.CreateSimpleEmbed(`You worked long hours ${work.overtimeMultiplier !== 1 ? "with overtime " : ""}and earned ${EnvData("EMOJI_TOKEN")}** ${work.tokensEarned.toLocaleString()}**! Come back in 1 hour to work another shift!`)], ephemeral: false });
		if (xp.hasAccountLeveledUp) return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Hey **@${interaction.user.username}**! You just advanced to level **${xp.level}**!`)], ephemeral: true }));
	}
}
