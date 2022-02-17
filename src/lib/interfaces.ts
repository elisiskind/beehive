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
  guesses: string[];
  friendCode?: {
    code: string;
    expiration: number;
  }
}