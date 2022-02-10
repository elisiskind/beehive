import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { firebaseAuth } from ".";
import { User as FirebaseUser } from "firebase/auth";
import firebase from "firebase/compat/app";

export type GridData = { [key: string]: { [key: number]: number } };

export interface Data {
  grid: GridData | undefined;
  answers: string[];
  guesses: string[];
  authLoading: boolean;
  user: User | null;
  login: () => void;
}

const generateGridMap = (answers: string[], guesses: string[]): GridData => {
  console.log("Generating grid with: ", answers, guesses);
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
    console.error("Failed to generate grid", e);
    return {};
  }
};

interface User {
  name: string | null;
  photo: string | null;
  id: string | null;
}

const extractUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (firebaseUser) {
    return {
      name: firebaseUser.displayName,
      photo: firebaseUser.photoURL,
      id: firebaseUser.uid,
    }
  } else {
    return null;
  }
};

export const DataContext = createContext<Data>({} as Data);

export const LocalStorageProvider: FunctionComponent = ({ children }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(
    null
  );

  const login = () => {
    setAuthLoading(true);
    chrome.identity.getAuthToken({interactive: true}, function(token) {
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential);
    });
  }

  useEffect(() => {
    firebaseAuth.onAuthStateChanged((user) => {
      setUser(extractUser(user));
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    const getStorage = async (key: string): Promise<any> => {
      return chrome?.storage?.local?.get(key);
    };

    getStorage("answers").then((value) => {
      setAnswers(value.answers);
    });
    getStorage("guesses").then((value) => setGuesses(value.guesses));
  }, []);

  useEffect(() => {
    if (chrome?.storage?.onChanged) {
      chrome?.storage.onChanged.addListener((changes: any) => {
        if (changes.guesses) {
          setGuesses(changes.guesses.newValue);
        }
        if (changes.answers) {
          setAnswers(changes.answers.newValue);
        }
      });
    }
  }, [chrome?.storage.onChanged]);

  const grid = generateGridMap(answers, guesses);

  return (
    <DataContext.Provider value={{ grid, answers, guesses, user, authLoading, login }}>
      {children}
    </DataContext.Provider>
  );
};

export default LocalStorageProvider;
