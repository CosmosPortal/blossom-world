/**
 * The structure of data for `AccountManager#ClaimWeekly()`
 */
export interface ClaimWeeklyStructure {
	/**
	 * Overrides the default clan bonus
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonusOverride?: number;
	/**
	 * Overrides the amount of default tokens the account earned
	 */
	defaultTokensEarnedOverride?: number;
}
