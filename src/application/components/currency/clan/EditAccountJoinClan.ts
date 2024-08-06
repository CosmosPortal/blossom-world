import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { ClanInformation } from "@lib/constants";
import { JoinableClan } from "@lib/enums";
import { Account, CreateResponse, FindOneEntity, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { Button, config, CooldownScope, execute } from "sunar";
import type { APIEmbed } from "discord.js";

const button = new Button({ id: /^EditAccountJoinClan_.+$/ });

config(button, { cooldown: { time: 3000, scope: CooldownScope.User } });

execute(button, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, userId, name] = interaction.customId.split("_");
	if (interaction.user.id !== userId) return void CreateResponse.InteractionError(interaction, `This exit button is controlled by <@${userId}>. Run the command yourself to use this.`);

	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });
	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));
	if (account.Clan !== JoinableClan.None) return void (await CreateResponse.InteractionError(interaction, `You are already in a clan! You are currently in the ${account.Clan} clan!`));
	if (account.Level < 5) return void (await CreateResponse.InteractionError(interaction, "You need to be level **5** in order to join a clan!"));

	const clanData = ClanInformation.filter((x) => x.name.toLowerCase() === name.toLowerCase());
	if (!clanData.length) return void (await CreateResponse.InteractionError(interaction, "I couldn't find the clan information!"));

	await interaction.deferUpdate();
	await interaction.deleteReply().catch(() => undefined);

	await UpdateEntity(Account, { Snowflake: interaction.user.id }, { Clan: JoinableClan[name as JoinableClan] });

	const embed: APIEmbed = {
		author: { name: `A message from ${clanData[0].leader} the leader of Clan ${name}` },
		color: Utility.DefaultColor(),
		description: clanData[0].onboarding.replaceAll(/{user.tag}/gi, `**@${interaction.user.tag}**`)
	};

	return void (await interaction.followUp({ embeds: [embed], ephemeral: true }));
});

export { button };
