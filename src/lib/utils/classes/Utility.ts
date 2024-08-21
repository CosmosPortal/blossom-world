import { Color } from "@lib/enums";
import type { APIEmbed } from "discord.js";

/**
 * An utility class for the client
 */
export class Utility {
	/**
	 * Creates a simple embed to be used
	 * @param {string} message - The message to use in the embed description
	 * @param {number} color - The color to use in the embed color
	 * @returns {APIEmbed} The embed data
	 */
	public static CreateSimpleEmbed(message: string, color?: number): APIEmbed {
		const data: APIEmbed = { description: message, color: color ?? this.DefaultColor() };
		return data;
	}

	/**
	 * Returns the client's default color, can be changed for holidays
	 * @returns {number} The color the client's currently using
	 */
	public static DefaultColor(): number {
		return Color.Default;
	}
}
