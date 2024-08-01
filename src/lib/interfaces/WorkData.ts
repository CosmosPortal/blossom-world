/**
 * The data that is returned when EconomyManager#Work() is executed
 */
export interface WorkData {
	/**
	 * The amount of cash being earned
	 */
	cash: number;
	/**
	 * The bonus given to a user for being in a clan, returns `0` if user is not in a clan
	 */
	clanBonus: number;
	/**
	 * The amount of cash the user earned, this adds `cash` and `clanBonus`, afterwards multiples `overtime`
	 */
	earned: number;
	/**
	 * The paycheck total after being updated
	 */
	paycheck: number;
	/**
	 * The multiplier earned due to overtime shift
	 */
	overtime: number;
}
