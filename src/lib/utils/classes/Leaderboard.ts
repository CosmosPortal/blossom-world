import { Account, Clans, Connect, Database } from "@lib/utils";

/**
 * Grab data from the leaderboard for certain features
 */
export class Leaderboard {
	/**
	 * Returns the user's rank for the leveling system
	 * @param {Account} account - The account you are trying to get the rank from
	 * @returns {Promise<number>} The user's rank or NaN
	 */
	public static async AccountLevelRank(account: Account): Promise<number> {
		if (!Database.isInitialized) await Connect();
		if (account.Level === 0) return NaN;

		const data = await Database.manager.createQueryBuilder(Account, "Account").where("account.Level > :level", { level: 0 }).orderBy("account.Level", "DESC").addOrderBy("account.CurrentXp", "DESC").getMany();
		const position = data.findIndex((x) => x.Snowflake === account.Snowflake) + 1;

		return position;
	}

	/**
	 * Returns the clan's rank for the leveling system
	 * @param {Clans} clan - The clan you are trying to get the rank from
	 * @returns {Promise<number>} The clan's rank or NaN
	 */
	public static async ClanLevelRank(clan: Clans): Promise<number> {
		if (!Database.isInitialized) await Connect();
		if (clan.Level === 0) return NaN;

		const data = await Database.manager.createQueryBuilder(Clans, "Clans").where("clan.Level > :level", { level: 0 }).orderBy("clan.Level", "DESC").addOrderBy("clan.CurrentXp", "DESC").getMany();
		const position = data.findIndex((x) => x.Clan === clan.Clan) + 1;

		return position;
	}
}
