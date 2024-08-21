/**
 * The structure of data for `AccountManager#AddXpToAccount()`
 */
export interface AddXpToAccountStructure {
	/**
	 * Overrides the default clan bonus
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonusOverride?: number;
	/**
	 * Overrides the amount of default xp the account earned
	 */
	defaultXpEarnedOverride?: number;
	/**
	 * Adds a multiplier for the xp being earned
	 */
	multiplier?: number;
}
