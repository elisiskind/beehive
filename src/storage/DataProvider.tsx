import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { generateGridMap, GridData } from "./grid";
import { getStorage, listenForUpdates, requestAnswers } from "./local";
import { Spinner } from "../components/spinner";
import { createUseStyles } from "react-jss";
import { Login } from "../Login";
import { listenForAuthUpdates, loginWithFirebase } from "../auth/auth";
import { saveGuesses } from "./firestore";

const useStyles = createUseStyles({
  rootLoading: {
    height: 360,
    width: 360,
    background: "#f7da21",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  root: {
    height: 360,
    width: 360,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});

export interface User {
  id: string;
  name: string | null;
  photo: string | null;
  email: string | null;
  friends: string[];
  guesses: string[];
}

export interface Data {
  grid: GridData | undefined;
  answers: string[];
  guesses: string[];
  user: User;
}

export interface Answers {
  words: string[];
  expiration: number;
}

export const DataContext = createContext<Data>({} as Data);

export const DataProvider: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const login = async () => {
    console.log("Starting login");
    setLoading(true);
    await loginWithFirebase();
  };

  // Initialize values in local storage and listen for updates
  useEffect(() => {
    if (user) {
      getStorage("answers").then((answers) => {
        if (!answers || answers.expiration * 1000 < new Date().getTime()) {
          requestAnswers();
        } else {
          setAnswers(answers);
          getStorage("guesses").then((guesses) => {
            if (guesses) {
              setGuesses(guesses);
              saveGuesses(user?.id, guesses)
            }
          });
        }
      });
      return listenForUpdates({
        guesses: (guesses) => {
          if (guesses) {
            setGuesses(guesses);
            saveGuesses(user?.id, guesses)
          }
        },
        answers: setAnswers,
      });
    }
  }, [user]);

  useEffect(() => {
    listenForAuthUpdates((user) => {
      setLoading(false);
      setUser(user);
    });
  }, []);

  if (!user && !loading) {
    return (
      <div className={classes.root}>
        <Login login={login} />
      </div>
    );
  }

  if (!answers || loading || !user) {
    return (
      <div className={classes.rootLoading}>
        <Spinner />
      </div>
    );
  }

  const grid = generateGridMap(answers.words, guesses);

  return (
    <DataContext.Provider
      value={{ grid, answers: answers.words, guesses, user }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
