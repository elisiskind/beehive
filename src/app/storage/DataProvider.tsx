import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { generateGridMap, GridData } from "./grid";
import { Spinner } from "../components/spinner";
import { createUseStyles } from "react-jss";
import { FriendCode, GameInfo, User } from "../../lib/interfaces";
import {
  ListenToFriendsRequestMessage,
  LoginRequestMessage,
  Messages,
} from "../../lib/messaging";
import { ChromeStorage } from "../../lib/storage";
import { isExpired } from "../../lib/utils";
import { GameInfoContext } from "./GameInfoProvider";
import { NavBar } from "../components/NavBar";
import { Words } from "../words/Words";

const useStyles = createUseStyles({
  rootLoading: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
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

  const { guesses, gameInfo, error } = useContext(GameInfoContext);

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<FriendCode | null>(null);
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
    ChromeStorage.listen("friend-code", setFriendCode);
    ChromeStorage.listen("friends", setFriends);
    ChromeStorage.listen("friend-requests", setFriendRequests);

    Promise.all([
      ChromeStorage.get("user").then((user) => {
        if (user) {
          Messages.send(new ListenToFriendsRequestMessage());
        }
        setUser(user);
      }),
      ChromeStorage.get("friend-code").then(setFriendCode),
      ChromeStorage.get("friends").then(setFriends),
      ChromeStorage.get("friend-requests").then(setFriendRequests),
    ]).then(() => setDataLoading(false));
  }, []);

  if (!user && !authLoading) {
    return (
      <div className={classes.root}>
        <NavBar login={login} />
        <Words/>
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

  const generateGrid = () => {
    if (isExpired(gameInfo)) {
      return null;
    } else {
      return generateGridMap(gameInfo.answers, guesses);
    }
  };

  return (
    <DataContext.Provider
      value={{
        grid: generateGrid(),
        gameInfo,
        guesses,
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
