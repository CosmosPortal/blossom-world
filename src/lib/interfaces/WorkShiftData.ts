/**
 * The data that is returned when `AccountManager#WorkShift()` is executed
 */
export interface WorkShiftData {
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
	 * The multiplier used due to overtime shift
	 * @note This will default to `1` if the account doesn't work an overtime shift
	 */
	overtimeMultiplier: number;
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
	 * @note This adds `clanBonus` and `defaultTokensEarned`, afterwards multiples `overtimeMultiplier`
	 */
	tokensEarned: number;
}
