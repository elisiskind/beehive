import { Logging } from "../../lib/logging";

export type GridData = { [key: string]: { [key: number]: number } };

export const generateGridMap = (answers: string[], guesses: string[]): GridData => {
  try {
    const grid: GridData = {};
    answers.forEach((word) => {
      const firstLetter = word.toUpperCase().charAt(0);
      if (!grid[firstLetter]) {
        grid[firstLetter] = {};
      }
      grid[firstLetter][word.length] =
        (grid[firstLetter][word.length] ?? 0) + 1;
    });
    guesses.forEach((word) => {
      const firstLetter = word.toUpperCase().charAt(0);
      const currentValue = grid[firstLetter]?.[word.length];
      if (currentValue > 0) {
        grid[firstLetter][word.length] = currentValue - 1;
      }
    });
    return grid;
  } catch (e) {
    Logging.error("Failed to generate grid", e);
    return {};
  }
};