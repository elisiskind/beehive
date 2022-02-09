import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";

export type GridData = { [key: string]: { [key: number]: number } };

export interface Data {
  grid: GridData | undefined;
  answers: string[];
  guesses: string[];
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

    console.log(grid);

    guesses.forEach((word) => {
      const firstLetter = word.toUpperCase().charAt(0);
      const currentValue = grid[firstLetter]?.[word.length];
      if (currentValue > 0) {
        grid[firstLetter][word.length] = currentValue - 1;
      }
    });

    console.log(grid);
    return grid;
  } catch (e) {
    console.error("Failed to generate grid", e);
    return {};
  }
};

export const DataContext = createContext<Data>({} as Data);

export const LocalStorageProvider: FunctionComponent = ({ children }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);

  useEffect(() => {
    const getStorage = async (key: string): Promise<any> => {
      return chrome?.storage?.local?.get(key);
    };

    getStorage("answers").then((value) => {
      setAnswers(value.answers);
    });
    getStorage("guesses").then((value) => setGuesses(value.guesses));
  }, [chrome?.storage?.local]);

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
    <DataContext.Provider value={{ grid, answers, guesses }}>
      {children}
    </DataContext.Provider>
  );
};

export default LocalStorageProvider;
