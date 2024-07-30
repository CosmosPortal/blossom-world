import { Utility } from "#lib/utils";
import type { ContextMenuCommandInteraction, InteractionResponse, Message, RepliableInteraction } from "discord.js";

/**
 * A class for creating a response
 */
export class CreateResponse {
	/**
	 * Creates an interaction ephemeral response to be used for the error system
	 * @param {ContextMenuCommandInteraction | RepliableInteraction } interaction - Your interaction class for creating the interaction response
	 * @param {string} message - The error message
	 * @param {number} error_color - The error color
	 * @returns {Promise<Message<boolean> | InteractionResponse<boolean>>} The interaction response
	 */
	public static async InteractionError(interaction: ContextMenuCommandInteraction | RepliableInteraction, message: string, error_color: number = 0xffb7c5): Promise<Message<boolean> | InteractionResponse<boolean>> {
		return await interaction[interaction.deferred || interaction.replied ? "followUp" : "reply"]({ embeds: [Utility.CreateSimpleEmbed(message, error_color)], ephemeral: true });
	}
}
