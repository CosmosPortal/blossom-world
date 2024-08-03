import { Account, Connect, Database } from "#lib/utils";

export class Leaderboard {
	public static async AccountLevelRank(account: Account) {
		if (!Database.isInitialized) await Connect();
		if (account.Level === 0) return NaN;

		const data = await Database.manager.createQueryBuilder(Account, "Account").where("account.Level > :level", { level: 0 }).orderBy("account.Level", "DESC").addOrderBy("account.CurrentXp", "DESC").getMany();
		const position = data.findIndex((x) => x.Snowflake === account.Snowflake) + 1;

		return position;
	}
}
