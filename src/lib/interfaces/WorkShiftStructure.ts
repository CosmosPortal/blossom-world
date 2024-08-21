/**
 * The structure of data for `AccountManager#WorkShift()`
 */
export interface WorkShiftStructure {
	/**
	 * Overrides the default clan bonus
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonusOverride?: number;
	/**
	 * Overrides the amount of default tokens the account earned
	 */
	defaultTokensEarnedOverride?: number;
	/**
	 * Adds a multiplier for the tokens being earned
	 */
	overtimeMultiplier?: number;
}
