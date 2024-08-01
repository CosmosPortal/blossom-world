/**
 * The data that is returned when EconomyManager#ManageClanXp() is executed
 */
export interface ManageClanXpData {
	/**
	 * The current level of the clan
	 */
	level: number;
	/**
	 * Whether the clan has leveled up or not
	 */
	leveledUp: boolean;
	/**
	 * The total amount of xp the clan has earned since created
	 */
	total: number;
	/**
	 * The amount of xp being earned
	 */
	xp: number;
}
