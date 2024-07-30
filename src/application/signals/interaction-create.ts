import { execute, Signal, Signals } from "sunar";
import { handleInteraction } from "sunar/handlers";

const signal = new Signal(Signals.InteractionCreate);

execute(signal, async (interaction) => {
	return await handleInteraction(interaction);
});

export { signal };
