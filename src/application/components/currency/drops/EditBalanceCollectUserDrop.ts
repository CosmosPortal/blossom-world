import { ApplicationCommandInfo } from "@cosmosportal/utilities";
import { Account, CreateResponse, EnvData, FindOneEntity, Sentry, UpdateEntity, Utility } from "@lib/utils";
import { Button, config, CooldownScope, execute } from "sunar";

const button = new Button({ id: /^EditBalanceCollectUserDrop_.+$/ });

config(button, { cooldown: { time: 3000, scope: CooldownScope.Channel } });

execute(button, async (interaction) => {
	if (await Sentry.MaintenanceModeStatus(interaction.client, interaction.user.id)) return void (await CreateResponse.InteractionError(interaction, "The developers are currently performing scheduled maintenance. Sorry for any inconvenience."));
	if (interaction.guild && !(await Sentry.IsAuthorized(interaction.guild.id))) return void (await CreateResponse.InteractionError(interaction, `**${interaction.guild.name}** is unauthorized to use ${interaction.client.user.username}.`));
	if (!(await Sentry.IsAuthorized(interaction.user.id))) return void (await CreateResponse.InteractionError(interaction, `You are unauthorized to use ${interaction.client.user.username}.`));

	const [customId, number] = interaction.customId.split("_");
	const amount = Number(number);
	const account = await FindOneEntity(Account, { Snowflake: interaction.user.id });

	if (!account) return void (await CreateResponse.InteractionError(interaction, `It seems like you don't have an account! Use </register:${await ApplicationCommandInfo(interaction.client, "register", "id")}> to register an account!`));

	await UpdateEntity(Account, { Snowflake: interaction.user.id }, { TokenBag: account.TokenBag + amount, TokenNetWorth: account.TokenNetWorth + amount });
	await interaction.update({ embeds: [Utility.CreateSimpleEmbed(`**@${interaction.user.tag}** collected the ${EnvData("EMOJI_TOKEN")} **${amount.toLocaleString()}**!`)], components: [] });
	await Utility.Wait(5000);
	return void (await interaction.deleteReply().catch(() => undefined));
});

export { button };
