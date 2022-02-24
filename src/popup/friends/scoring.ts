import { Rank, Ranks } from "../../lib/interfaces";

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

export const getRank = (
  score: number,
  words: string[],
  pangrams: string[]
): Rank => {
  const total = getScore(words, pangrams);

  const ranks: Ranks = (
    [
      [Rank.BEGINNER, 0],
      [Rank.GOOD_START, 2],
      [Rank.MOVING_UP, 5],
      [Rank.GOOD, 8],
      [Rank.SOLID, 15],
      [Rank.NICE, 25],
      [Rank.GREAT, 40],
      [Rank.AMAZING, 50],
      [Rank.GENIUS, 70],
      [Rank.QUEEN_BEE, 100],
    ] as Ranks
  ).map(([rank, minScore]) => {
    return [rank, Math.round((minScore / 100) * total)];
  });

  let currentMaxScore = 0;
  let currentRank = Rank.BEGINNER;
  for (let [rank, maxScore] of ranks) {
    if (score >= maxScore && maxScore >= currentMaxScore) {
      currentRank = rank;
      currentMaxScore = maxScore;
    }
  }

  return currentRank;
};
