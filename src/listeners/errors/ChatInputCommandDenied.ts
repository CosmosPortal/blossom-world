import { CreateResponse } from "@lib/utils";
import { ApplyOptions } from "@sapphire/decorators";
import { DurationFormatter } from "@sapphire/duration";
import { Events, Identifiers, Listener, type ChatInputCommandDeniedPayload, type UserError } from "@sapphire/framework";
import type { CommandWithCooldown } from "@lib/interfaces";

@ApplyOptions<Listener.Options>({ name: Events.ChatInputCommandDenied })
export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		if (error.identifier === Identifiers.PreconditionCooldown) {
			const cooldown = error.context as CommandWithCooldown;
			return CreateResponse.InteractionError(interaction, `You are going to fast! Please wait **${new DurationFormatter().format(cooldown.remaining, 4, { right: ", " })}** before executing this command again.`);
		}
	}
}
