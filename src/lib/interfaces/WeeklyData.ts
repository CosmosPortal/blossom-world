/**
 * The data that is returned when CurrencyManager#Weekly() is executed
 */
export interface WeeklyData {
	/**
	 * The current amount of tokens inside the bag
	 */
	bag: number;
	/**
	 * The bonus given to the user for being in a clan, returns `0` if the user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The amount of tokens the user earned, this adds `tokens` and `clanBonus`
	 */
	earned: number;
	/**
	 * The current net worth of the user
	 */
	netWorth: number;
	/**
	 * The amount of tokens being earned
	 */
	tokens: number;
}
