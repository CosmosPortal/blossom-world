/**
 * The data that is returned when EconomyManager#Daily() is executed
 */
export interface DailyData {
	/**
	 * The amount of cash being earned
	 */
	cash: number;
	/**
	 * The bonus given to a user for being in a clan, returns `0` if user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The current daily streak
	 */
	dailyStreak: number;
	/**
	 * The amount of cash the user earned, this adds `cash` and `clanBonus`, afterwards multiples `streakBonus`
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
	 * The total amount of cash the user earned since they registered an account
	 */
	totalNetWorth: number;
	/**
	 * The current wallet of the user
	 */
	wallet: number;
}
