import { ButtonBuilder } from "@cosmosportal/utilities";
import { Utility } from "@lib/utils";
import { ButtonStyle, type ContextMenuCommandInteraction, type InteractionResponse, type Message, type RepliableInteraction } from "discord.js";

/**
 * A class for creating a response
 */
export class CreateResponse {
	/**
	 * Creates an interaction ephemeral response to be used for the respawn system.
	 * @param {ContextMenuCommandInteraction | RepliableInteraction } interaction - Your interaction class for creating the interaction response
	 * @param {number} error_color - The error color
	 * @returns {Promise<Message<boolean> | InteractionResponse<boolean>>} The interaction response
	 */
	public static async DeathInteractionError(interaction: ContextMenuCommandInteraction | RepliableInteraction, error_color: number = 0xffb7c5): Promise<Message<boolean> | InteractionResponse<boolean>> {
		const actionRow = new ButtonBuilder().CreateRegularButton({ customId: `EditAttributesRespawn_${interaction.user.id}`, label: "Respawn", style: ButtonStyle.Primary }).BuildActionRow();

		return await interaction[interaction.deferred || interaction.replied ? "followUp" : "reply"]({ embeds: [Utility.CreateSimpleEmbed("Oh no! It looks like you have died from running this command! Due to your unfortunate death, you have lost your token bag and now have to start over. Please click the button below to respawn.", error_color)], components: [actionRow], ephemeral: true });
	}

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

	/**
	 * Creates an interaction ephemeral response to be used for the respawn system.
	 * @param {ContextMenuCommandInteraction | RepliableInteraction } interaction - Your interaction class for creating the interaction response
	 * @param {number} error_color - The error color
	 * @returns {Promise<Message<boolean> | InteractionResponse<boolean>>} The interaction response
	 */
	public static async RespawnInteractionError(interaction: ContextMenuCommandInteraction | RepliableInteraction, error_color: number = 0xffb7c5): Promise<Message<boolean> | InteractionResponse<boolean>> {
		const actionRow = new ButtonBuilder().CreateRegularButton({ customId: `EditAttributesRespawn_${interaction.user.id}`, label: "Respawn", style: ButtonStyle.Primary }).BuildActionRow();

		return await interaction[interaction.deferred || interaction.replied ? "followUp" : "reply"]({ embeds: [Utility.CreateSimpleEmbed("Oh no! It looks like you have died! Due to your unfortunate death, you have lost your token bag and now have to start over. Please click the button below to respawn.", error_color)], components: [actionRow], ephemeral: true });
	}
}
