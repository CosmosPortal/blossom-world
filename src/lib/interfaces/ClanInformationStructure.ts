/**
 * The structure of data needed to create a clan
 */
export interface ClanInformationStructure {
	id: `${number}`;
	name: string;
	primaryName: `Clan of ${string}`;
	leader: string;
	description: string;
	onboarding: string;
}
