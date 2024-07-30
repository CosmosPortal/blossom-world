import { Connect, Database } from "#lib/utils";
import type { DeepPartial, FindOneOptions, ObjectType } from "typeorm";

/**
 * Finds the given entity data, if not found, creates the entity with the given data
 * @param {ObjectType<T>} entity - The entity to find
 * @param {FindOneOptions<T>["where"]} criteria - The structure of data used to located or create the entity
 * @returns {Promise<T>} The entity data
 */
export async function FindOrCreateEntity<T>(entity: ObjectType<T>, criteria: FindOneOptions<T>["where"]): Promise<T> {
	if (!Database.isInitialized) await Connect();

	const check = await Database.manager.findOne(entity, { where: criteria });
	if (check) return check as T;

	const data = await Database.manager.create(entity, criteria as DeepPartial<T>);
	await Database.manager.save(data);

	return data;
}
