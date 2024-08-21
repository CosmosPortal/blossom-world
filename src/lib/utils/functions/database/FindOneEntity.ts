import { Connect, Database } from "@lib/utils";
import type { FindOneOptions, FindOptionsRelations, ObjectLiteral, ObjectType } from "typeorm";

/**
 * Find one entity with the given data
 * @param {ObjectType<T>} entity - The entity class you are trying to find
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to locate the entity
 * @param {FindOptionsRelations<T>} relations - The strucutre of data used to gather relations
 * @returns {Promise<T> | null} The entity data if it exist, returns null otherwise
 */
export async function FindOneEntity<T extends ObjectLiteral>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"], relations?: FindOptionsRelations<T>): Promise<T | null> {
	if (!Database.isInitialized) await Connect();

	const data = (await Database.manager.findOne<T>(entity, { where: criteria, relations: relations ?? undefined })) as T | null;

	return data;
}
