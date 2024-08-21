import { Connect, EnvData } from "@lib/utils";
import { Time } from "@sapphire/duration";
import { ApplicationCommandRegistries, BucketScope, container, LogLevel, RegisterBehavior, SapphireClient } from "@sapphire/framework";
import { GatewayIntentBits } from "discord.js";

const client = new SapphireClient({
	intents: [GatewayIntentBits.Guilds],
	allowedMentions: { parse: [], repliedUser: false },
	defaultCooldown: { delay: Time.Second * 3, scope: BucketScope.User },
	logger: { level: LogLevel.Debug }
});

await Connect();

container.logger.info(`[Database Connected] | Client is connected to TypeORM`);

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);

await client.login(EnvData("CLIENT_TOKEN"));
