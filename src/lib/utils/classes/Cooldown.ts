import { CooldownManager, CreateEntity, DeleteEntity, FindOneEntity } from "@lib/utils";
import type { Snowflake } from "@lib/types";

/**
 * Manage cooldowns for a key
 */
export class Cooldown {
	/**
	 * Checks if the given key is on cooldown
	 * @param {string} key - The cooldown key
	 * @returns {Promise<number>} The amount time left
	 */
	public static async CheckCooldown(key: string): Promise<number> {
		const data = await FindOneEntity(CooldownManager, { Key: key });
		if (!data) return 0;

		const time = Date.now();
		if (data.Duration > time) return data.Duration - time;

		this.DeleteCooldown(key);

		return 0;
	}

	/**
	 * Deletes a cooldown
	 * @param {string} key - The cooldown key
	 * @returns {Promise<void>} Returns void when executed
	 */
	public static async DeleteCooldown(key: string): Promise<void> {
		await DeleteEntity(CooldownManager, { Key: key });
	}

	/**
	 * Returns a cooldown's data, returns null if it doesn't exist
	 * @param {string} key - The cooldown key
	 * @returns {Promise<CooldownManager | null>} The cooldown data or null
	 */
	public static async GetCooldown(key: string): Promise<CooldownManager | null> {
		return await FindOneEntity(CooldownManager, { Key: key });
	}

	/**
	 * Sets a cooldown for the given key
	 * @param {string} key - A key to find the cooldown
	 * @param {number} duration - The duration of the cooldown in milliseconds
	 * @param {Snowflake} snowflake - The snowflake the cooldown belongs to
	 * @returns {Promise<CooldownManager>} - The cooldown data
	 */
	public static async SetCooldown(key: string, duration: number, snowflake: Snowflake): Promise<CooldownManager> {
		const time = Date.now() + duration;
		const data = await CreateEntity(CooldownManager, { Key: key, Duration: time, Snowflake: snowflake });

		return data;
	}
}
