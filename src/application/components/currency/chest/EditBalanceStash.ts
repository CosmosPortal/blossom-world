import { ApplicationCommandInfo, ButtonBuilder } from "@cosmosportal/utilities";
import { Account, CreateResponse, EnvData, FindOneEntity, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { ButtonStyle, type APIEmbed } from "discord.js";
import { config, CooldownScope, execute, Modal } from "sunar";

const modal = new Modal({ id: "EditBalanceStash" });

config(modal, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(modal, async (interaction) => {
	if (!interaction.isFromMessage()) return;
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const amount = Number(interaction.fields.getTextInputValue("amount"));
	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });

	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));
	if (isNaN(amount)) return void (await CreateResponse.InteractionError(interaction, "You did not enter a valid number."));
	if (!amount) return void (await CreateResponse.InteractionError(interaction, "Please enter an amount higher than zero!"));
	if (!Number.isInteger(amount)) return void (await CreateResponse.InteractionError(interaction, "The number you entered was not an integer!"));
	if (amount > account.TokenBag) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you have in your token bag."));
	if (amount > account.TokenChestStorage - account.TokenChest) return void (await CreateResponse.InteractionError(interaction, "You entered an amount higher than what you can store!"));

	await UpdateEntity(Account, { Snowflake: interaction.user.id }, { TokenBag: account.TokenBag - amount, TokenChest: account.TokenChest + amount });

	const { TokenBag, TokenChest, TokenChestStorage, TokenNetWorth } = (await FindOneEntity(Account, { Snowflake: interaction.user.id })) as Account;

	const embed: APIEmbed = {
		author: { name: `@${interaction.user.tag}'s Chest Balance` },
		color: Utility.DefaultColor(),
		fields: [{ name: `Tokens┃${EnvData("EMOJI_TOKEN")} \`${TokenNetWorth.toLocaleString()}\``, value: `Bag • ${EnvData("EMOJI_TOKEN")} \`${TokenBag.toLocaleString()}\`\nChest • ${EnvData("EMOJI_TOKEN")} \`${TokenChest.toLocaleString()}\`\nChest Storage • \`${TokenChest.toLocaleString()}/${TokenChestStorage.toLocaleString()}\``, inline: true }]
	};

	const actionRow = new ButtonBuilder()
		.CreateRegularButton({ customId: `ViewBalanceCollect_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest === 0, label: "Collect" })
		.CreateRegularButton({ customId: `ViewBalanceStash_${interaction.user.id}`, style: ButtonStyle.Secondary, disabled: TokenChest >= TokenChestStorage || TokenBag === 0, label: "Stash" })
		.BuildActionRow();

	return void (await interaction.update({ embeds: [embed], components: [actionRow] }));
});

export { modal };
