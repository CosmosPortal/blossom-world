/**
 * Picks a random string from the array
 * @param {string[]} array - The array of strings
 * @returns {string} The random string
 */
export function RandomString(array: string[]): string {
	return array[Math.floor(Math.random() * array.length)];
}
