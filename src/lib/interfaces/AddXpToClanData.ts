/**
 * The data that is returned when `ClanManager#AddXpToClan()` is executed
 */
export interface AddXpToClanData {
	/**
	 * The amount of default xp being earned
	 */
	defaultXpEarned: number;
	/**
	 * Whether the clan has leveled up or not
	 */
	hasClanLeveledUp: boolean;
	/**
	 * Whether the clan has reached the maximum level
	 * @note The current maximum level is `50`
	 */
	hasClanReachedLimit: boolean;
	/**
	 * The current level of the clan
	 */
	level: number;
	/**
	 * The amount of xp the clan earned
	 */
	xpEarned: number;
}
