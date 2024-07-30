import { FindOrCreateEntity, Roles } from "#lib/utils";
import { MemberHasPermissions } from "@cosmosportal/utilities";
import type { Guild, GuildMember } from "discord.js";

/**
 * A class for managing guild's staff team members
 */
export class StaffTeamMember {
	/**
	 * Checks if the member is allowed to edit the client's guild settings
	 * @param {Guild} guild - Your guild class to fetch needed data
	 * @param {GuildMember} member - The guild member class to fetch roles and IDs
	 * @returns {Promise<boolean>} True if the member can edit the client's guild settings, false otherwise
	 */
	public static async HasGuildSettingAuthorization(guild: Guild, member: GuildMember): Promise<boolean> {
		if (!guild || !member) return false;

		const roles = member.roles.cache.map((x) => x.id);
		const { ApplicationManagementTeam, ManagementTeam, OwnerTeam } = await FindOrCreateEntity(Roles, { Snowflake: guild.id });
		const teamId = ApplicationManagementTeam.concat(ManagementTeam, OwnerTeam);

		return member.id === guild.ownerId || (await MemberHasPermissions(guild, member.id, ["Administrator"])) || roles.some((x) => teamId.includes(x));
	}

	/**
	 * Checks if the member is part of the Moderation Team or higher
	 * @param {Guild} guild - Your guild class to fetch needed data
	 * @param {GuildMember} member - The guild member class to fetch roles and IDs
	 * @returns {Promise<boolean>} True if the member is part of the team, false otherwise
	 */
	public static async IsMemberofModerationTeam(guild: Guild, member: GuildMember): Promise<boolean> {
		if (!guild || !member) return false;

		const roles = member.roles.cache.map((x) => x.id);
		const { ManagementTeam, ModerationTeam, OwnerTeam } = await FindOrCreateEntity(Roles, { Snowflake: guild.id });
		const teamId = ManagementTeam.concat(ModerationTeam, OwnerTeam);

		return member.id === guild.ownerId || (await MemberHasPermissions(guild, member.id, ["Administrator"])) || roles.some((x) => teamId.includes(x));
	}
}
