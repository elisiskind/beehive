export enum Rank {
  BEGINNER = "Beginner",
  GOOD_START = "Good Start",
  MOVING_UP = "Moving Up",
  GOOD = "Good",
  SOLID = "Solid",
  NICE = "Nice",
  GREAT = "Great",
  AMAZING = "Amazing",
  GENIUS = "Genius",
  QUEEN_BEE = "♛ Queen Bee",
}

// @ts-ignore
export const rankRanking: Record<Rank, number> = Object.values(Rank).reduce((prev: Record<Rank, number>, r: Rank, index) => {
    prev[r] = index;
    return prev;
  }, {});

export type Ranks = [Rank, number][];

export interface GameInfo {
  answers: string[];
  centerLetter: string;
  displayDate: string;
  displayWeekday: string;
  expiration: number;
  id: number;
  outerLetters: string[];
  pangrams: string[];
  printDate: string;
  validLetters: string[];
}

export interface User {
  id: string;
  name: string | null;
  photo: string;
  email: string | null;
  friends: string[];
  guesses: {
    [gameId: number]: string[];
  };
}

export interface Guesses {
  id: number;
  words: string[];
}

export interface FriendCode {
  code: string;
  userId: string;
  expiration: number;
}
