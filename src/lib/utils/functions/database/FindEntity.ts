import { Connect, Database } from "#lib/utils";
import type { FindOneOptions, ObjectType } from "typeorm";

/**
 * Finds entities with the given data
 * @param {ObjectType<T>} entity - The entity class to find
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to located the entity
 * @returns {Promise<T[]>} An array of entities
 */
export async function FindEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T[]> {
	if (!Database.isInitialized) await Connect();
	const data = await Database.manager.find(entity, { where: criteria });

	return data as T[];
}
