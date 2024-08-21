import { RandomNumber } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, Attributes, Connect, Currency, Database, FindOneEntity, Levels, UpdateEntity } from "@lib/utils";
import type { AddXpToAccountData, AddXpToAccountStructure, ClaimDailyData, ClaimDailyStructure, ClaimWeeklyData, ClaimWeeklyStructure, EnergyRemovalData, HealthRemovalData, WorkShiftData, WorkShiftStructure } from "@lib/interfaces";
import type { Snowflake } from "@lib/types";

export class AccountManager {
	/**
	 * Checks if an account exist
	 * @param {Snowflake} userId - The user's ID to check if the account exist
	 * @returns {Promise<boolean>} True if the account exist, false otherwise
	 */
	public static async AccountExist(userId: Snowflake): Promise<boolean> {
		const data = (await this.FetchAccount(userId)) as Account;
		return !!data;
	}

	/**
	 *
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @param {AddXpToAccountStructure} structure - The structure of data for override data
	 * @returns {Promise<AddXpToAccountData>} The data after the method was executed
	 */
	public static async AddXpToAccount(userId: Snowflake, structure: AddXpToAccountStructure = {}): Promise<AddXpToAccountData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { CurrentXp, Level, RequiredXp, Snowflake } = data.Levels;

		if (Level === 50) return { clanBonus: NaN, defaultXpEarned: NaN, hasAccountLeveledUp: false, hasAccountReachedLimit: true, level: Level, xpEarned: NaN };

		const defaultXpEarned = structure.defaultXpEarnedOverride ?? RandomNumber(25, 50);
		const clanBonus = data.Clan === JoinableClan.None ? 0 : (structure.clanBonusOverride ?? RandomNumber(25, 50));
		const xpEarned = (defaultXpEarned + clanBonus) * (structure.multiplier ?? 1);
		let checkLevel = Level;

		if (CurrentXp + xpEarned >= RequiredXp) checkLevel = checkLevel + 1;

		await UpdateEntity(Levels, { Snowflake }, { CurrentXp: checkLevel === Level ? CurrentXp + xpEarned : checkLevel === 50 ? 0 : CurrentXp + xpEarned - RequiredXp, Level: checkLevel, RequiredXp: checkLevel === Level ? RequiredXp : RequiredXp + 500 });

		return { clanBonus, defaultXpEarned, hasAccountLeveledUp: checkLevel !== Level, hasAccountReachedLimit: checkLevel === 50, level: checkLevel, xpEarned };
	}

	/**
	 * Runs the `/daily` command
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @param {ClaimDailyStructure} structure - The structure of data for override data
	 * @returns {Promise<ClaimDailyData>} The data after the method was executed
	 */
	public static async ClaimDaily(userId: Snowflake, structure: ClaimDailyStructure = {}): Promise<ClaimDailyData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { DailyStreak, Snowflake, TokenBag, TokenNetWorth } = data.Currency;

		const defaultTokensEarned = structure.defaultTokensEarnedOverride ?? 1000;
		const clanBonus = data.Clan === JoinableClan.None ? 0 : (structure.clanBonusOverride ?? RandomNumber(250, 500));
		const checkStreak = DailyStreak + 1 >= 7;
		const streakCompleteMultiplier = checkStreak ? (structure.streakCompleteMultiplier ?? 2) : 1;
		const tokensEarned = (defaultTokensEarned + clanBonus) * streakCompleteMultiplier;

		await UpdateEntity(Currency, { Snowflake }, { DailyStreak: checkStreak ? 0 : DailyStreak + 1, TokenBag: TokenBag + tokensEarned, TokenNetWorth: TokenNetWorth + tokensEarned });

		return { clanBonus, dailyStreakCount: checkStreak ? 0 : DailyStreak + 1, defaultTokensEarned, hasDailyStreakReset: checkStreak, streakCompleteMultiplier, tokenBag: TokenBag + tokensEarned, tokenNetWorth: TokenNetWorth + tokensEarned, tokensEarned };
	}

	/**
	 * Runs the `/weekly` command
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @param {ClaimWeeklyStructure} structure - The structure of data for override data
	 * @returns {Promise<ClaimWeeklyData>} The data after the method was executed
	 */
	public static async ClaimWeekly(userId: Snowflake, structure: ClaimWeeklyStructure = {}): Promise<ClaimWeeklyData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Snowflake, TokenBag, TokenNetWorth } = data.Currency;

		const defaultTokensEarned = structure.defaultTokensEarnedOverride ?? 5000;
		const clanBonus = data.Clan === JoinableClan.None ? 0 : (structure.clanBonusOverride ?? RandomNumber(500, 750));
		const tokensEarned = defaultTokensEarned + clanBonus;

		await UpdateEntity(Currency, { Snowflake }, { TokenBag: TokenBag + tokensEarned, TokenNetWorth: TokenNetWorth + tokensEarned });

		return { clanBonus, defaultTokensEarned, tokenBag: TokenBag + tokensEarned, tokenNetWorth: TokenNetWorth + tokensEarned, tokensEarned };
	}

	/**
	 * Fetches an account's entity class
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @returns {Promise<Account | null>} The account's entity class or null
	 */
	public static async FetchAccount(userId: Snowflake): Promise<Account | null> {
		const data = await FindOneEntity(Account, { Snowflake: userId }, { Attributes: true, Currency: true, Inventory: true, Levels: true });
		return data;
	}

	/**
	 * Fetches the account's rank from the leveling system
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @returns {Promise<number>} The account's rank in the leveling system, returns `NaN` if the account's level is `0`
	 */
	public static async FetchAccountLevelingRank(userId: Snowflake): Promise<number> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Level } = data.Levels;

		if (!Database.isInitialized) await Connect();
		if (Level === 0) return NaN;

		const leaderboard = await Database.manager.createQueryBuilder(Levels, "Levels").where("Levels.Level > :level", { level: 0 }).orderBy("Levels.Level", "DESC").addOrderBy("Levels.CurrentXp", "DESC").getMany();
		const position = leaderboard.findIndex((x) => x.Snowflake === userId) + 1;

		return position;
	}

	/**
	 * Checks if an account is dead or not
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @returns {Promise<boolean>} True if the account is dead, false otherwise
	 */
	public static async HasAccountDied(userId: Snowflake): Promise<boolean> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Health } = data.Attributes;
		return Health === 0;
	}

	/**
	 * Removes energy from an account
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @returns {Promise<EnergyRemovalData>} The data after the method was executed
	 */
	public static async RemoveEnergyFromAccount(userId: Snowflake): Promise<EnergyRemovalData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Energy, Snowflake } = data.Attributes;

		if (Energy <= 0) return { emptyEnergy: true, energy: Energy, energyLeft: Energy, energyLost: NaN };

		const energyLost = RandomNumber(3, 10);
		let energyLeft = Energy - energyLost;

		if (energyLeft <= 0) energyLeft = 0;

		await UpdateEntity(Attributes, { Snowflake }, { Energy: energyLeft });

		return { emptyEnergy: energyLeft <= 0, energy: Energy, energyLeft, energyLost };
	}

	/**
	 * Removes health from an account
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @returns {Promise<HealthRemovalData>} The data after the method was executed
	 */
	public static async RemoveHealthFromAccount(userId: Snowflake): Promise<HealthRemovalData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Energy, Health, Snowflake } = data.Attributes;

		if (Health <= 0) return { emptyHealth: true, health: Health, healthLeft: Health, healthLost: NaN };
		if (Energy !== 0) return { emptyHealth: false, health: Health, healthLeft: Health, healthLost: NaN };

		const healthLost = RandomNumber(5, 15);
		let healthLeft = Health - healthLost;

		if (healthLeft <= 0) healthLeft = 0;

		await UpdateEntity(Attributes, { Snowflake }, { Health: healthLeft });

		if (healthLeft <= 0) await UpdateEntity(Currency, { Snowflake }, { TokenBag: 0, TokenNetWorth: data.Currency.TokenNetWorth - data.Currency.TokenBag });

		return { emptyHealth: healthLeft <= 0, health: Health, healthLeft, healthLost };
	}

	/**
	 * Runs the `/work` command
	 * @param {Snowflake} userId - The user's ID to fetch the account from
	 * @param {WorkShiftStructure} structure - The structure of data for override data
	 * @returns {Promise<WorkShiftData>} The data after the method was executed
	 */
	public static async WorkShift(userId: Snowflake, structure: WorkShiftStructure = {}): Promise<WorkShiftData> {
		const data = (await this.FetchAccount(userId)) as Account;
		const { Snowflake, TokenBag, TokenNetWorth } = data.Currency;

		const defaultTokensEarned = structure.defaultTokensEarnedOverride ?? RandomNumber(100, 250);
		const clanBonus = data.Clan === JoinableClan.None ? 0 : (structure.clanBonusOverride ?? RandomNumber(25, 100));
		const overtimeMultiplier = RandomNumber(0, 100) >= 75 ? (structure.overtimeMultiplier ?? 2) : 1;
		const tokensEarned = (defaultTokensEarned + clanBonus) * overtimeMultiplier;

		await UpdateEntity(Currency, { Snowflake }, { TokenBag: TokenBag + tokensEarned, TokenNetWorth: TokenNetWorth + tokensEarned });

		return { clanBonus, defaultTokensEarned, overtimeMultiplier, tokenBag: TokenBag + tokensEarned, tokenNetWorth: TokenNetWorth + tokensEarned, tokensEarned };
	}
}
