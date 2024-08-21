/**
 * The data that is returned when `AccountManager#RemoveHealthFromAccount()` is executed
 */
export interface HealthRemovalData {
	/**
	 * Whether the account's health is empty after being executed
	 */
	emptyHealth: boolean;
	/**
	 * The amount of health the account had before being executed
	 */
	health: number;
	/**
	 * The amount of health left after being executed
	 */
	healthLeft: number;
	/**
	 * The amount of health lost
	 */
	healthLost: number;
}
