import { ClanInformation } from "@lib/constants";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	public override parse(interaction: AutocompleteInteraction) {
		const focused = interaction.options.getFocused(true);
		if (!focused.name) return this.none();

		const choices = ClanInformation.filter((x) => x.id.includes(focused.value) || x.leader.toLowerCase().includes(focused.value.toLowerCase()) || x.name.toLowerCase().includes(focused.value.toLowerCase()) || x.primaryName.toLowerCase().includes(focused.value.toLowerCase()) || `The ${x.primaryName}`.toLowerCase().includes(focused.value.toLowerCase()));
		const data = choices.map((x) => ({ name: `The ${x.primaryName}`, value: x.name }));

		return this.some(data);
	}

	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
		return void (await interaction.respond(result.slice(0, 25)).catch(() => {}));
	}
}
