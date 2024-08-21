import { RandomNumber } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Clans, Connect, Database, FindOrCreateEntity, UpdateEntity } from "@lib/utils";
import type { AddXpToClanData } from "@lib/interfaces";

export class ClanManager {
	/**
	 * Adds xp to a clan's leveling data
	 * @param {Exclude<JoinableClan, JoinableClan.None>} clan - The clan you are adding the xp to
	 * @returns {Promise<AddXpToClanData>} The data after the method was executed
	 */
	public static async AddXpToClan(clan: Exclude<JoinableClan, JoinableClan.None>): Promise<AddXpToClanData> {
		const { Clan, CurrentXp, Level, RequiredXp } = await this.FetchClan(clan);

		if (Level === 50) return { defaultXpEarned: NaN, hasClanLeveledUp: false, hasClanReachedLimit: true, level: Level, xpEarned: NaN };

		const defaultXpEarned = RandomNumber(25, 50);
		let checkLevel = Level;

		if (CurrentXp + defaultXpEarned >= RequiredXp) checkLevel = checkLevel + 1;

		await UpdateEntity(Clans, { Clan }, { CurrentXp: checkLevel === Level ? CurrentXp + defaultXpEarned : checkLevel === 50 ? 0 : CurrentXp + defaultXpEarned - RequiredXp, Level: checkLevel, RequiredXp: checkLevel === Level ? RequiredXp : RequiredXp + 500 });

		return { defaultXpEarned, hasClanLeveledUp: checkLevel !== Level, hasClanReachedLimit: checkLevel === 50, level: checkLevel, xpEarned: defaultXpEarned };
	}

	/**
	 * Fetches a clan's entity class
	 * @param {Exclude<JoinableClan, JoinableClan.None>} clan - The clan you are fetching
	 * @returns {Promise<Clans>} The clan's entity class
	 */
	public static async FetchClan(clan: Exclude<JoinableClan, JoinableClan.None>): Promise<Clans> {
		const data = await FindOrCreateEntity(Clans, { Clan: clan });
		return data;
	}

	/**
	 * Fetches the clan's rank from the leveling system
	 * @param {Exclude<JoinableClan, JoinableClan.None>} clan - The clan to fetch the account from
	 * @returns {Promise<number>} The clan's rank in the leveling system, returns `NaN` if the clan's level is `0`
	 */
	public static async FetchClanLevelingRank(clan: Exclude<JoinableClan, JoinableClan.None>): Promise<number> {
		const data = (await this.FetchClan(clan)) as Clans;
		const { Level } = data;

		if (!Database.isInitialized) await Connect();
		if (Level === 0) return NaN;

		const leaderboard = await Database.manager.createQueryBuilder(Clans, "Clans").where("Clans.Level > :level", { level: 0 }).orderBy("Clans.Level", "DESC").addOrderBy("Clans.CurrentXp", "DESC").getMany();
		const position = leaderboard.findIndex((x) => x.Clan === clan) + 1;

		return position;
	}
}
