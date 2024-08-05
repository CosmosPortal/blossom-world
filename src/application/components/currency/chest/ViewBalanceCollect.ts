import { ApplicationCommandInfo, ModalBuilder } from "@cosmosportal/utilities";
import { Account, CreateResponse, FindOneEntity, Sentry } from "@lib/utils";
import { TextInputStyle } from "discord.js";
import { Button, config, CooldownScope, execute } from "sunar";

const button = new Button({ id: /^ViewBalanceCollect_.+$/ });

config(button, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(button, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, userId] = interaction.customId.split("_");
	if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This collect button is controlled by <@${userId}>. Run the command yourself to use this.`);

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	const modal = new ModalBuilder({ custom_id: "EditBalanceCollect", title: "Chest Manager" })
		.CreateTextInput({
			custom_id: "amount",
			label: "Enter the amount of tokens you are collecting",
			style: TextInputStyle.Short,
			max_length: String(account.TokenChest).length,
			placeholder: `You can take out ${account.TokenChest.toLocaleString()}!`,
			required: true,
			value: String(account.TokenChest)
		})
		.BuildResponse();

	return void (await interaction.showModal(modal));
});

export { button };
