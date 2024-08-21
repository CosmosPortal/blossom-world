import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { JoinableClan } from "@lib/enums";
import { Account, AccountManager, CreateResponse, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { APIEmbed, ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith("EditAccountJoinClan_")) return this.none();
		return this.some();
	}

	public async run(interaction: ButtonInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId, name] = interaction.customId.split("_");
		const account = await AccountManager.FetchAccount(interaction.user.id);
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());

		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This exit button is controlled by <@${userId}>. Run the command yourself to use this.`);
		if (!account) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (account.Clan !== JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are already in a clan! You are currently in the ${account.Clan} clan!`));
		if (account.Levels.Level < 5) return void (await CreateResponse.InteractionError(interaction, "You need to be level **5** in order to join a clan!"));
		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "It looks like you didn't enter an existing clan name!"));

		await interaction.deferUpdate();
		await interaction.deleteReply().catch(() => undefined);
		await UpdateEntity(Account, { Snowflake: interaction.user.id }, { Clan: JoinableClan[name as JoinableClan] });

		const embed: APIEmbed = {
			author: { name: `A message from ${clanData[0].leader} the leader of Clan ${name}` },
			color: Utility.DefaultColor(),
			description: clanData[0].onboarding.replaceAll(/{user.tag}/gi, `**@${interaction.user.tag}**`)
		};

		return void (await interaction.followUp({ embeds: [embed], ephemeral: true }));
	}
}
