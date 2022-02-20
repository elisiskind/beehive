export type Levels = [string, number][];

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
  photo: string | null;
  email: string | null;
  friends: string[];
  friendCode?: {
    code: string;
    expiration: number;
  },
  guesses: {
    [gameId: number]: string[];
  }
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