import { Connect, Database } from "#lib/utils";
import type { FindOneOptions, ObjectType } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";

/**
 * Updates an entity with the given data
 * @param {ObjectType<T>} entity - The entity class to update
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to located the entity
 * @param {QueryDeepPartialEntity<T>} partialEntity - The updated data
 * @returns {Promise<void>} Returns void once executed
 */
export async function UpdateEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"], partialEntity: QueryDeepPartialEntity<T>): Promise<void> {
	if (!Database.isInitialized) await Connect();
	return void (await Database.manager.update(entity, criteria, partialEntity));
}
