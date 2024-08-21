/**
 * The data that is returned when `AccountManager#AddXpToAccount()` is executed
 */
export interface AddXpToAccountData {
	/**
	 * The bonus given to the account for being in a clan
	 * @note This will default to `0` if the account is not in a clan!
	 */
	clanBonus: number;
	/**
	 * The amount of default xp being earned
	 */
	defaultXpEarned: number;
	/**
	 * Whether the account has leveled up or not
	 */
	hasAccountLeveledUp: boolean;
	/**
	 * Whether the account has reached the maximum level
	 * @note The current maximum level is `50`
	 */
	hasAccountReachedLimit: boolean;
	/**
	 * The current level of the account
	 */
	level: number;
	/**
	 * The amount of xp the account earned
	 * @note This adds `clanBonus` and `defaultXpEarned`
	 */
	xpEarned: number;
}
