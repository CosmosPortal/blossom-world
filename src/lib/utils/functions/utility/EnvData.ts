import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

/**
 * Returns an environment variable
 * @param {string} name - The environment variable to look for
 * @param {string} fallback - A string to return if the environment variable is not found
 * @returns {string} The environment variable
 */
export function EnvData(name: string, fallback?: string): string {
	const data = process.env[name] ?? fallback;
	if (!data) throw new Error(`Environment variable ${name} was not found.`);

	return data;
}
