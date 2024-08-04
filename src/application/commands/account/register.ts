import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { Account, CreateEntity, CreateResponse, FindOneEntity, Sentry, Utility } from "@lib/utils";
import { config, CooldownScope, execute, Slash } from "sunar";

const slash = new Slash({
	name: "register",
	description: "Register an account on Starlight Bank"
});

config(slash, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(slash, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	await interaction.deferReply({ ephemeral: true });

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (account) return void (await CreateResponse.InteractionError(interaction, `It seems like you already have an account! Use </profile:${await ApplicationCommandInfo(interaction.client, "profile", "id")}> to view your account!`));

	const { CreationTimestamp } = await CreateEntity(Account, { Snowflake: interaction.user.id });

	return void (await interaction.followUp({ embeds: [Utility.CreateSimpleEmbed(`Your account was successfully created on <t:${Math.trunc(Math.floor(CreationTimestamp.getTime() / 1000))}:D>!`)] }));
});

export { slash };
