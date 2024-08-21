import { ApplicationCommandInfo, ProgressBar, StringSelectMenuBuilder } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { AccountManager, ClanManager, Clans, CreateResponse, EnvData, FindOrCreateEntity, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { JoinableClan } from "@lib/enums";
import type { APIEmbed, StringSelectMenuInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class SelectMenuHandler extends InteractionHandler {
	public override parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith("ViewClanInformation_")) return this.none();
		return this.some();
	}

	public async run(interaction: StringSelectMenuInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const [, userId] = interaction.customId.split("_");
		const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === interaction.values[0].toLowerCase());

		if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This exit button is controlled by <@${userId}>. Run the command yourself to use this.`);
		if (!AccountManager.AccountExist(interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, `Hey **@${interaction.user.username}**, it looks like you don't have an account registered! Use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));
		if (await AccountManager.HasAccountDied(interaction.user.id)) return void (await CreateResponse.RespawnInteractionError(interaction));
		if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "It looks like you didn't enter an existing clan name!"));

		const { CurrentXp, Level, RequiredXp, TokenChest, TokenNetWorth } = await FindOrCreateEntity(Clans, { Clan: interaction.values[0] as Exclude<JoinableClan, JoinableClan.None> });
		const level = ProgressBar({ currentXp: CurrentXp, emptySymbol: "◇", fillSymbol: "◆", requiredXp: RequiredXp });
		const rank = await ClanManager.FetchClanLevelingRank(interaction.values[0] as Exclude<JoinableClan, JoinableClan.None>);

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

		return void (await interaction.update({ embeds: [embed], components: [actionRow] }));
	}
}
