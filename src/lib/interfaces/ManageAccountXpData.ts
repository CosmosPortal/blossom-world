/**
 * The data that is returned when EconomyManager#ManageAccountXp() is executed
 */
export interface ManageAccountXpData {
	/**
	 * The bonus given to a user for being in a clan, returns `0` if user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The amount of xp the user earned, this adds `clanBonus` and `xp`
	 */
	earned: number;
	/**
	 * The current level of the user
	 */
	level: number;
	/**
	 * Whether the user has leveled up or not
	 */
	leveledUp: boolean;
	/**
	 * The total amount of xp the user has earned since they registered an account
	 */
	total: number;
	/**
	 * The amount of xp being earned
	 */
	xp: number;
}
