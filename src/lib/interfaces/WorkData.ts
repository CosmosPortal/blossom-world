/**
 * The data that is returned when EconomyManager#Work() is executed
 */
export interface WorkData {
	/**
	 * The current amount of tokens inside the bag
	 */
	bag: number;
	/**
	 * The bonus given to the user for being in a clan, returns `0` if the user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The amount of tokens the user earned, this adds `tokens` and `clanBonus`, afterwards multiples `overtime`
	 */
	earned: number;
	/**
	 * The current net worth of the user
	 */
	netWorth: number;
	/**
	 * The multiplier earned due to overtime shift
	 */
	overtime: number;
	/**
	 * The amount of tokens being earned
	 */
	tokens: number;
}
