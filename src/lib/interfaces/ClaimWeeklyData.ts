/**
 * The data that is returned when `AccountManager#ClaimWeekly()` is executed
 */
export interface ClaimWeeklyData {
	/**
	 * The bonus given to the account for being in a clan
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonus: number;
	/**
	 * The amount of default tokens being earned
	 */
	defaultTokensEarned: number;
	/**
	 * The current amount of the token bag
	 */
	tokenBag: number;
	/**
	 * The current net worth of the account
	 */
	tokenNetWorth: number;
	/**
	 * The amount of tokens the account earned
	 * @note This adds `clanBonus` and `defaultTokensEarned`
	 */
	tokensEarned: number;
}
