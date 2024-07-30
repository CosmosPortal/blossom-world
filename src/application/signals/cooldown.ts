import { CreateResponse } from "#lib/utils";
import { DurationFormatter } from "@sapphire/duration";
import { execute, Signal, Signals } from "sunar";

const signal = new Signal(Signals.Cooldown);

execute(signal, async (interaction, { remaining }) => {
	return void (await CreateResponse.InteractionError(interaction, `Please wait **${new DurationFormatter().format(remaining, 4, { right: ", " })}** for your cooldown to end.`));
});

export { signal };
