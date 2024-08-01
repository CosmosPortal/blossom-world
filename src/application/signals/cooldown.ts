import { CreateResponse } from "#lib/utils";
import { DurationFormatter } from "@sapphire/duration";
import { execute, Signal, Signals } from "sunar";

const signal = new Signal(Signals.Cooldown);

execute(signal, async (interaction, { remaining }) => {
	return void (await CreateResponse.InteractionError(interaction, `You are going to fast! Please wait **${new DurationFormatter().format(remaining, 4, { right: ", " })}** before executing this command again.`));
});

export { signal };
