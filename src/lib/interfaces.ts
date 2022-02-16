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

export interface Guesses {
  guesses: string[],
  expiration: number
}

export interface User {
  id: string;
  name: string | null;
  photo: string | null;
  email: string | null;
  friends: string[];
  guesses: Guesses;
  friendCode?: {
    code: string;
    expiration: number;
  }
}