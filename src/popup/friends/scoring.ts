import { Levels } from "../../lib/interfaces";

export const getScore = (words: string[], pangrams: string[]) => {
  return words
    .map((word) => {
      return word.length === 4
        ? 1
        : pangrams.includes(word)
        ? word.length + 7
        : word.length;
    })
    .reduce((a, b) => a + b, 0);
};

export const getLevel = (
  score: number,
  words: string[],
  pangrams: string[]
) => {
  const total = getScore(words, pangrams);

  const levels: Levels = (
    [
      ["Beginner", 0],
      ["Good Start", 2],
      ["Moving Up", 5],
      ["Good", 8],
      ["Solid", 15],
      ["Nice", 25],
      ["Great", 40],
      ["Amazing", 50],
      ["Genius", 70],
    ] as Levels
  ).map(([title, minScore]) => {
    return [title, Math.round((minScore / 100) * total)];
  });

  console.log(levels)

  let currentMaxScore = 0;
  let currentRank = "";
  for (let [rank, maxScore] of levels) {
    if (score >= maxScore && maxScore >= currentMaxScore) {
      currentRank = rank;
      currentMaxScore = maxScore;
    }
  }
  return currentRank;
};
