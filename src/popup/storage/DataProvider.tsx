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
import { FriendCode, GameInfo, Guesses, User } from "../../lib/interfaces";
import {
  GameInfoRequestMessage,
  ListenToFriendsRequestMessage,
  LoginRequestMessage,
  Messages,
} from "../../lib/messaging";
import { ChromeStorage } from "../../lib/storage";
import { isExpired } from "../../lib/utils";
import { Logging } from "../../lib/logging";

const useStyles = createUseStyles({
  rootLoading: {
    height: 360,
    width: 480,
    background: "#f7da21",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  root: {
    height: 360,
    width: 480,
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
  friendCode: FriendCode | null;
  friends: User[];
  friendRequests: User[];
}

export const DataContext = createContext<Data>({} as Data);

export const DataProvider: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [friendCode, setFriendCode] = useState<FriendCode | null>(null);
  const [guesses, setGuesses] = useState<Guesses | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[] | null>(null);
  const [friendRequests, setFriendRequests] = useState<User[] | null>(null);

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
    ChromeStorage.listen("friend-code", setFriendCode);
    ChromeStorage.listen("guesses", setGuesses);
    ChromeStorage.listen("friends", setFriends);
    ChromeStorage.listen("friend-requests", setFriendRequests);

    Promise.all([
      ChromeStorage.get("user").then((user) => {
        if (user) {
          Messages.send(new ListenToFriendsRequestMessage());
        }
        setUser(user);
      }),
      ChromeStorage.get("guesses").then(setGuesses),
      ChromeStorage.get("friend-code").then(setFriendCode),
      ChromeStorage.get("friends").then(setFriends),
      ChromeStorage.get("friend-requests").then(setFriendRequests),
      ChromeStorage.get("game-info").then((gameInfo) => {
        if (gameInfo && !isExpired(gameInfo)) {
          setGameInfo(gameInfo);
        } else {
          Logging.info("Requesting game info because it is expired.");
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
        <div>
          gameInfo: {JSON.stringify(!!gameInfo)}
        </div>
        <div>
          dataLoading: {JSON.stringify(dataLoading)}
        </div>
        <div>
          authLoading: {JSON.stringify(authLoading)}
        </div>
        <div>
          user: {JSON.stringify(!!user)}
        </div>
        <Spinner />
      </div>
    );
  }

  const generateGrid = () => {
    if (isExpired(gameInfo)) {
      return null;
    } else if (!guesses || guesses.id !== gameInfo.id) {
      return generateGridMap(gameInfo.answers, []);
    } else {
      return generateGridMap(gameInfo.answers, guesses.words);
    }
  };

  return (
    <DataContext.Provider
      value={{
        grid: generateGrid(),
        gameInfo,
        guesses: guesses?.id === gameInfo.id ? guesses.words : [],
        user,
        friendCode,
        friends: friends ?? [],
        friendRequests: friendRequests ?? [],
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
