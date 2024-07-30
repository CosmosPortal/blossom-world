import { Connect, Database } from "#lib/utils";
import type { FindOneOptions, ObjectType } from "typeorm";

/**
 * Find one entity with the given data
 * @param {ObjectType<T>} entity - The entity class to find
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to located the entity
 * @returns {Promise<T> | null} The entity data or null
 */
export async function FindOneEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T | null> {
	if (!Database.isInitialized) await Connect();

	const data = (await Database.manager.findOne(entity, { where: criteria })) as T | null;

	return data;
}
