import { Connect, Database } from "#lib/utils";
import type { DeepPartial, FindOneOptions, ObjectType } from "typeorm";

/**
 * Creates an entity with the given data
 * @param {ObjectType<T>} entity - The entity class to create
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to create the entity
 * @returns {Promise<T>} The entity data
 */
export async function CreateEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T> {
	if (!Database.isInitialized) await Connect();

	const data = await Database.manager.create(entity, criteria as DeepPartial<T>);
	await Database.manager.save(data);

	return data;
}
