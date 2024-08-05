/**
 * The data that is returned when CurrencyManager#Daily() is executed
 */
export interface DailyData {
	/**
	 * The current amount of tokens inside the bag
	 */
	bag: number;
	/**
	 * The bonus given to the user for being in a clan, returns `0` if the user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The current daily streak
	 */
	dailyStreak: number;
	/**
	 * The amount of tokens the user earned, this adds `tokens` and `clanBonus`, afterwards multiples `streakBonus`
	 */
	earned: number;
	/**
	 * The current net worth of the user
	 */
	netWorth: number;
	/**
	 * Whether the daily streak was reset or not
	 */
	resetStreak: boolean;
	/**
	 * The multiplier earned due to the daily streak resetting
	 */
	streakBonus: number;
	/**
	 * The amount of tokens being earned
	 */
	tokens: number;
}
