import React, {
  createContext,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { generateGridMap, GridData } from "./grid";
import { Spinner } from "../components/spinner";
import { createUseStyles } from "react-jss";
import { Login } from "../Login";
import { GameInfo, User } from "../../lib/interfaces";
import {
  GameInfoRequestMessage,
  LoginRequestMessage,
  Messages,
} from "../../lib/messaging";
import { ChromeStorage } from "../../lib/storage";

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

export interface Data {
  grid: GridData | null;
  gameInfo: GameInfo;
  guesses: string[];
  user: User;
}

export const DataContext = createContext<Data>({} as Data);

export const DataProvider: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const login = async () => {
    setAuthLoading(true);
    Messages.send(new LoginRequestMessage());
  };

  // Initialize values in local storage and listen for updates
  useEffect(() => {
    ChromeStorage.listen("user", (user) => {
      if (user) {
        setAuthLoading(false);
      }
      setUser(user);
    });
    ChromeStorage.listen("game-info", setGameInfo);
    Promise.all([
      ChromeStorage.get("user").then(setUser),
      ChromeStorage.get("guesses").then((guesses) => setGuesses(guesses ?? [])),
      ChromeStorage.get("game-info").then((gameInfo) => {
        if (gameInfo) {
          setGameInfo(gameInfo);
        } else {
          Messages.send(
            new GameInfoRequestMessage(),
            "nytimes.com/puzzles/spelling-bee"
          );
        }
      }),
    ]).then(() => setDataLoading(false));
  }, []);

  if (!user && !authLoading) {
    return (
      <div className={classes.root}>
        <Login login={login} />
      </div>
    );
  }

  if (!gameInfo || dataLoading || authLoading || !user) {
    return (
      <div className={classes.rootLoading}>
        <Spinner />
      </div>
    );
  }

  const now = new Date().getTime();
  const answers = gameInfo.expiration * 1000 > now ? gameInfo.answers : null;
  const grid = answers ? generateGridMap(answers, guesses) : null;

  return (
    <DataContext.Provider value={{ grid, gameInfo, guesses, user }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
