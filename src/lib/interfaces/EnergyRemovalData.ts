/**
 * The data that is returned when `AccountManager#RemoveEnergyFromAccount()` is executed
 */
export interface EnergyRemovalData {
	/**
	 * Whether the account's energy is empty after being executed
	 */
	emptyEnergy: boolean;
	/**
	 * The amount of energy the account had before being executed
	 */
	energy: number;
	/**
	 * The amount of energy left after being executed
	 */
	energyLeft: number;
	/**
	 * The amount of energy lost
	 */
	energyLost: number;
}
