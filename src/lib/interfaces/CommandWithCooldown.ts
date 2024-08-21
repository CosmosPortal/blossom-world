/**
 * An interface for `@sapphire/framework` UserError#context
 */
export interface CommandWithCooldown {
	/**
	 * The remaining cooldown in milliseconds
	 */
	remaining: number;
}
