/**
 * The data that is returned when `AccountManager#ClaimDaily()` is executed
 */
export interface ClaimDailyData {
	/**
	 * The bonus given to the account for being in a clan
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonus: number;
	/**
	 * The current amount of streaks the account ran
	 */
	dailyStreakCount: number;
	/**
	 * The amount of default tokens being earned
	 */
	defaultTokensEarned: number;
	/**
	 * Whether the daily streak has reset or not
	 */
	hasDailyStreakReset: boolean;
	/**
	 * The multiplier used when the streak is reset
	 * @note This will default to `1` if the account's daily streak was not reset
	 */
	streakCompleteMultiplier: number;
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
	 * @note This adds `clanBonus` and `defaultTokensEarned`, afterwards multiples `streakCompleteMultiplier`
	 */
	tokensEarned: number;
}
