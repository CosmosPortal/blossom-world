/**
 * The data that is returned when CurrencyManager#ManageClanXp() is executed
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
	 * The amount of xp being earned
	 */
	xp: number;
}
