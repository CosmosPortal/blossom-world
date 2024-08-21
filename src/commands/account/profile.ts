import { ApplicationCommandInfo, ProgressBar } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { AccountManager, CreateResponse, EnvData, Sentry, Utility } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { ApplicationCommandOptionType, type APIEmbed } from "discord.js";

@ApplyOptions<Command.Options>({
	name: "profile",
	description: "View your profile or someone else",
	options: ["user", "visibility"]
})
export class ProfileCommand extends Command {
	public override registerApplicationCommands(register: Command.Registry) {
		register.registerChatInputCommand({
			name: "profile",
			description: "View your profile or someone else",
			options: [
				{
					name: "user",
					description: "Whose profile would you like to view?",
					type: ApplicationCommandOptionType.User
				},
				{
					name: "visibility",
					description: "Should others be able to view the response?",
					type: ApplicationCommandOptionType.Boolean
				}
			]
		});
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
		if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

		const user = interaction.options.getUser("user", false) || interaction.user;
		const account = await AccountManager.FetchAccount(user.id);

		if (!account) return void (await CreateResponse.InteractionError(interaction, `It looks like **@${user.username}** doesn't have an account registered! Ask them to use </account register:${await ApplicationCommandInfo(interaction.client, "account", "id")}> to register an account.`));

		const { Energy, Health } = account.Attributes;
		const { TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = account.Currency;
		const { FishingRod, Pickaxe, Shovel } = account.Inventory;
		const { CurrentXp, Level, RequiredXp } = account.Levels;

		const rank = await AccountManager.FetchAccountLevelingRank(user.id);
		const health = ProgressBar({ currentXp: Health, emptySymbol: "🤍", fillSymbol: "❤️", length: 5, requiredXp: 100 });
		const energy = ProgressBar({ currentXp: Energy, length: 5, requiredXp: 50 });
		const level = ProgressBar({ currentXp: CurrentXp, emptySymbol: "◇", fillSymbol: "◆", requiredXp: RequiredXp });

		const embed: APIEmbed = {
			author: { name: `${user.username}'s Profile${account.Clan !== JoinableClan.None ? `┃Clan of ${account.Clan}` : ""}`, icon_url: user.displayAvatarURL({ forceStatic: false, size: 4096 }) },
			color: Utility.DefaultColor(),
			fields: [
				{ name: "— Attributes", value: `> **Health**┃\`${Health}/100\`\n> ${health.bar}\n> **Energy**┃\`${Energy}/50\`\n> ${energy.bar}`, inline: true },
				{ name: "— Level", value: `> Rank • \`#${isNaN(rank) ? "?" : rank.toLocaleString()}\`\n> Level • \`${Level.toLocaleString()}\`\n> Experience • \`${CurrentXp.toLocaleString()}/${RequiredXp.toLocaleString()}\`\n> ${level.bar} ${level.percentage}%`, inline: true },
				{ name: `— Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `> Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\n> Chest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\n> Chest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\`` },
				{ name: "— Tools", value: `> Fishing Rod • \`${FishingRod.toLocaleString()}\`\n> Pickaxe • \`${Pickaxe.toLocaleString()}\`\n> Shovel • \`${Shovel.toLocaleString()}\`` }
			]
		};

		return void (await interaction.reply({ embeds: [embed], ephemeral: interaction.options.getBoolean("visibility", false) || undefined }));
	}
}
