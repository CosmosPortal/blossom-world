import { Connect, Database } from "#lib/utils";
import type { FindOneOptions, ObjectType } from "typeorm";

/**
 * Deletes an entity with the given data
 * @param {ObjectType<T>} entity - The entity class to delete
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to located the entity
 * @returns {Promise<void>} Returns void once executed
 */
export async function DeleteEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<void> {
	if (!Database.isInitialized) await Connect();
	await Database.manager.delete(entity, criteria);
}
