import { Connect, EnvData } from "#lib/utils";
import { GatewayIntentBits, Partials } from "discord.js";
import { Client, dirname, load } from "sunar";

const client = new Client<true>({
	intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
	partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User],
	allowedMentions: { parse: [], repliedUser: false }
});

await Connect();

console.log(`[Database Connected] | Client is connected to TypeORM`);

await load(`${dirname(import.meta.url)}/application/{commands,signals,components}/**/*.{js,ts}`);

await client.login(EnvData("CLIENT_TOKEN"));
