/**
 * Authorization levels for the account security
 */
export enum AuthorizationLevel {
	/**
	 * Lost all access to use the client
	 */
	Unauthorized = 0,
	/**
	 * Access to use the client but cannot bypass maintenance mode
	 */
	Authorized = 1,
	/**
	 * Access to use the client during maintenance mode
	 */
	BypassAuthorization = 2
}
