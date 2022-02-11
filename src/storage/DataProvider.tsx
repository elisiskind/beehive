import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { generateGridMap, GridData } from "./grid";
import { getStorage, listenForUpdates } from "../storage/storage";
import { User } from "../AuthProvider";


export interface Data {
  grid: GridData | undefined;
  answers: string[];
  guesses: string[];
  user: User
}



export const DataContext = createContext<Data>({} as Data);

interface DataProviderProps {
  user: User;
}

export const DataProvider: FunctionComponent<DataProviderProps> = ({ children, user }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);

  // Initialize values in local storage and listen for updates
  useEffect(() => {
    getStorage("answers").then(setAnswers);
    getStorage("guesses").then(setGuesses);
    listenForUpdates({
      guesses: setGuesses,
      answers: setAnswers
    })
  }, []);

  const grid = generateGridMap(answers, guesses);

  return (
    <DataContext.Provider value={{ grid, answers, guesses, user }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
