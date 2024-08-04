import { RandomNumber } from "@cosmosportal/utilities";
import { JoinableClan } from "@lib/enums";
import { Account, FindOrCreateEntity, Clans, UpdateEntity } from "@lib/utils";
import type { DailyData, ManageAccountXpData, ManageClanXpData, WorkData } from "@lib/interfaces";
import type { ChatInputCommandInteraction } from "discord.js";

/**
 * Manage an economy command, xp, clans, and more
 */
export class EconomyManager {
	/**
	 * Runs the daily command
	 * @param {ChatInputCommandInteraction} interaction - Your interaction class for fetching data
	 * @param {Account} account - The account belonging to the user
	 * @returns {Promise<DailyData>} The daily data
	 */
	public static async Daily(interaction: ChatInputCommandInteraction, account: Account): Promise<DailyData> {
		const { Clan, DailyStreak, TokenBag, TokenNetWorth } = account;
		const tokens = 1000;
		const clanBonus = Clan === JoinableClan.None ? 0 : RandomNumber(250, 500);
		const resetStreak = DailyStreak + 1 >= 7;
		const streakBonus = resetStreak ? 2 : 1;
		const earned = (tokens + clanBonus) * streakBonus;

		await UpdateEntity(Account, { Snowflake: interaction.user.id }, { DailyStreak: resetStreak ? 0 : DailyStreak + 1, TokenBag: TokenBag + earned, TokenNetWorth: TokenNetWorth + earned });

		return { bag: TokenBag + earned, clanBonus, dailyStreak: resetStreak ? 0 : DailyStreak + 1, earned, netWorth: TokenNetWorth + earned, resetStreak, streakBonus, tokens };
	}

	/**
	 * Manage an account's xp
	 * @param {ChatInputCommandInteraction} interaction - Your interaction class for fetching data
	 * @param {Account} account - The account belonging to the user
	 * @returns {Promise<ManageAccountXpData>} The data after being executed
	 */
	public static async ManageAccountXp(interaction: ChatInputCommandInteraction, account: Account): Promise<ManageAccountXpData> {
		const { Clan, CurrentXp, Level, RequiredXp } = account;
		const xp = RandomNumber(25, 50);
		const clanBonus = Clan === JoinableClan.None ? 0 : RandomNumber(25, 50);
		const earned = xp + clanBonus;
		let levelUp = Level;

		if (CurrentXp + earned >= RequiredXp) levelUp = levelUp + 1;

		await UpdateEntity(Account, { Snowflake: interaction.user.id }, { CurrentXp: levelUp === Level ? CurrentXp + earned : CurrentXp + earned - RequiredXp, Level: levelUp, RequiredXp: levelUp === Level ? RequiredXp : RequiredXp + 100 });

		return { clanBonus, earned, level: levelUp, leveledUp: levelUp !== Level, xp };
	}

	/**
	 * Manages a clan's xp
	 * @param {Exclude<ClanEnum, ClanEnum.None>} clan - The clan the user is in
	 * @returns {Promise<ManageClanXpData>} The data after being executed
	 */
	public static async ManageClanXp(clan: Exclude<JoinableClan, JoinableClan.None>): Promise<ManageClanXpData> {
		const { CurrentXp, Level, RequiredXp } = await FindOrCreateEntity(Clans, { Clan: clan });
		const xp = RandomNumber(25, 50);
		let levelUp = Level;

		if (CurrentXp + xp >= RequiredXp) levelUp = levelUp + 1;

		await UpdateEntity(Clans, { Clan: clan }, { CurrentXp: levelUp === Level ? CurrentXp + xp : CurrentXp + xp - RequiredXp, Level: levelUp, RequiredXp: levelUp === Level ? RequiredXp : RequiredXp + 100 });

		return { level: levelUp, leveledUp: levelUp !== Level, xp };
	}

	/**
	 * Runs the work command
	 * @param {ChatInputCommandInteraction} interaction - Your interaction class for fetching data
	 * @param {Account} account - The account belonging to the user
	 * @returns {Promise<WorkData>} The work data
	 */
	public static async Work(interaction: ChatInputCommandInteraction, account: Account): Promise<WorkData> {
		const { Clan, TokenBag, TokenNetWorth } = account;
		const tokens = RandomNumber(100, 250);
		const clanBonus = Clan === JoinableClan.None ? 0 : RandomNumber(25, 100);
		const overtime = RandomNumber(0, 100) >= 75 ? 2 : 1;
		const earned = (tokens + clanBonus) * overtime;

		await UpdateEntity(Account, { Snowflake: interaction.user.id }, { TokenBag: TokenBag + earned, TokenNetWorth: TokenNetWorth + earned });

		return { bag: TokenBag + earned, clanBonus, earned, netWorth: TokenNetWorth + earned, overtime, tokens };
	}
}
