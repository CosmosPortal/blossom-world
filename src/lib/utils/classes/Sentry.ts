import { AuthorizationLevel } from "#lib/enums";
import { AccountSecurity, Developer, FindOrCreateEntity } from "#lib/utils";
import type { Client } from "discord.js";
import type { Snowflake } from "#lib/types";

/**
 * A security class for the client
 */
export class Sentry {
	/**
	 * Checks if the snowflake is able to use the client
	 * @param {Snowflake} snowflake - The snowflake to check
	 * @returns {Promise<boolean>} Whether the snowflake is able to use the client or not
	 */
	public static async IsAuthorized(snowflake: Snowflake): Promise<boolean> {
		const account = await FindOrCreateEntity(AccountSecurity, { Snowflake: snowflake });
		return account.AuthorizationLevel === AuthorizationLevel.Authorized || account.AuthorizationLevel === AuthorizationLevel.BypassAuthorization;
	}

	/**
	 * Checks if the maintenance mode is enabled, if enabled checks if the snowflake is able to use the client during maintenance
	 * @param {Client<true>} client - Your client class to fetch the client's ID
	 * @param {Snowflake} snowflake - The snowflake to check
	 * @returns {Promise<boolean>} Whether the snowflake is able to use the client or not
	 */
	public static async MaintenanceModeStatus(client: Client<true>, snowflake?: Snowflake): Promise<boolean> {
		const { MaintenanceModeStatus } = await FindOrCreateEntity(Developer, { Snowflake: client.user.id });
		if (!snowflake) return MaintenanceModeStatus;

		const account = await FindOrCreateEntity(AccountSecurity, { Snowflake: snowflake });
		const bypassAuthorization = !(account.AuthorizationLevel === AuthorizationLevel.BypassAuthorization);

		return !MaintenanceModeStatus ? false : !bypassAuthorization;
	}
}
