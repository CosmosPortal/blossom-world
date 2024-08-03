/**
 * The structure of data to create a progress bar
 */
export interface ProgressBarStructure {
	/**
	 * The current xp
	 */
	currentXp: number;
	/**
	 * The required xp before leveling up
	 */
	requiredXp: number;
	/**
	 * A symbol or emoji for creating the bar
	 */
	emptySymbol?: string;
	/**
	 * A symbol or emoji for creating the bar
	 */
	fillSymbol?: string;
	/**
	 * The length of the bar
	 */
	length?: number;
}
