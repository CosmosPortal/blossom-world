import { ApplicationCommandInfo, ModalBuilder } from "@cosmosportal/utilities";
import { Account, CreateResponse, FindOneEntity, Sentry } from "@lib/utils";
import { TextInputStyle } from "discord.js";
import { Button, config, CooldownScope, execute } from "sunar";

const button = new Button({ id: /^ViewBalanceStash_.+$/ });

config(button, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(button, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, userId] = interaction.customId.split("_");
	if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This stash button is controlled by <@${userId}>. Run the command yourself to use this.`);

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const modal = new ModalBuilder({ customId: "EditBalanceStash", title: "Chest Manager" })
		.CreateTextInput({
			customId: "amount",
			label: "Enter the amount of tokens you are stashing",
			style: TextInputStyle.Short,
			maxLength: String(account.TokenChestStorage).length,
			placeholder: `${account.TokenChest.toLocaleString()}/${account.TokenChestStorage.toLocaleString()}`,
			required: true,
			value: String(account.TokenChestStorage - account.TokenChest > account.TokenBag ? account.TokenBag : account.TokenChestStorage - account.TokenChest)
		})
		.BuildResponse();

	return void (await interaction.showModal(modal));
});

export { button };
