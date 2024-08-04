import type { ProgressBarData, ProgressBarStructure } from "@lib/interfaces";

/**
 * Creates a bar and returns a percentage
 * @param {ProgressBarStructure} structure - The strucutre of data needed for creating the progress bar
 * @returns {ProgressBarData} The progress bar and percentage
 */
export function ProgressBar(structure: ProgressBarStructure): ProgressBarData {
	const length = structure.length ?? 10;
	const emptySymbol = structure.emptySymbol ?? "▱";
	const fillSymbol = structure.fillSymbol ?? "▰";
	const percentage = Math.round((structure.currentXp / structure.requiredXp) * 100);
	const fill = Math.round((length * structure.currentXp) / structure.requiredXp);
	const empty = length - fill;
	const bar = fillSymbol.repeat(fill) + emptySymbol.repeat(empty);

	return { bar, percentage };
}
