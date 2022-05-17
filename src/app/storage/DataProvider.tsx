import React, {
  createContext,
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateGridMap, GridData } from "./grid";
import { Spinner } from "../components/spinner";
import { createUseStyles } from "react-jss";
import { FriendCode, GameInfo, User } from "../../lib/interfaces";
import { isExpired } from "../../lib/utils";
import { GameInfoContext } from "./GameInfoProvider";
import { NavBar } from "../components/NavBar";
import { firebaseApp, firestore } from "../index";
import { Logging } from "../../lib/logging";
import { Unsubscribe } from "@firebase/firestore";
import { generateFriendCode } from "../firebase/friends";
import { AuthRefreshRequest, AuthRequest, Messages } from "../../lib/messaging";

const useStyles = createUseStyles({
  rootLoading: {
    position: "relative",
    width: "100%",
  },
  loading: {
    position: "absolute",
    height: "calc(var(--vh, 1vh) * 64 + 60px);",
    width: "100%",
    visibility: ({ on }: StyleProps) => (on ? "visible" : "hidden"),
    transition: "visibility 0.3s ease-out, opacity 0.3s ease-in-out",
    background: "white",
    opacity: ({ on }: StyleProps) => (on ? 1 : 0),
    zIndex: 1,
    overflow: "hidden",
  },
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

const getToken = async (interactive: boolean) => {
  const response = await Messages.send(new AuthRequest(interactive));
  if (Messages.isAuthResponse(response)) {
    return response.token;
  } else if (Messages.isAuthFailure(response)) {
    throw new Error(response.error);
  } else {
    throw new Error(
      `Unrecognized response: ${JSON.stringify(response, null, "  ")}`
    );
  }
};

const refreshToken = async (interactive: boolean) => {
  const response = await Messages.send(new AuthRefreshRequest(interactive));
  if (Messages.isAuthResponse(response)) {
    return response.token;
  } else if (Messages.isAuthFailure(response)) {
    throw new Error(response.error);
  } else {
    throw new Error(
      `Unrecognized response: ${JSON.stringify(response, null, "  ")}`
    );
  }
};

interface StyleProps {
  on: boolean;
}

export interface Data {
  grid: GridData | null;
  gameInfo: GameInfo;
  guesses: string[];
  user: User;
  friendCode: FriendCode | null;
  friends: User[];
  friendRequests: User[];
  mutations: {
    requestFriendCode: () => void;
    addFriend: (code: string) => Promise<string>;
    logout: () => Promise<void>;
    acceptFriendRequest: (friendId: string) => Promise<void>;
    removeFriendRequest: (friendId: string) => Promise<void>;
  };
}

export const DataContext = createContext<Data>({} as Data);

export const DataProvider: FunctionComponent = ({ children }) => {
  const { guesses, gameInfo, refreshGameInfo } = useContext(GameInfoContext);

  const [loggedIn, setLoggedIn] = useState<boolean>();
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<FriendCode | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [friends, setFriends] = useState<User[] | null>(null);
  const [friendRequests, setFriendRequests] = useState<User[] | null>(null);
  const friendShipListenerUnsubscribe = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    chrome.storage.local.get("loggedIn").then(({ loggedIn: loggedInValue }) => {
      setLoggedIn(loggedInValue);
    });
  }, []);

  const acceptFriendRequest = useCallback(
    async (friendId: string) => {
      if (user) {
        await firestore.acceptFriendRequest(friendId, user.id);
      } else {
        throw new Error("Not signed in");
      }
    },
    [user]
  );

  const removeFriendRequest = useCallback(
    async (friendId: string) => {
      if (user) {
        await firestore.removeFriend(user.id, friendId);
      } else {
        throw new Error("Not signed in");
      }
    },
    [user]
  );

  const addFriend = useCallback(
    async (code: string): Promise<string> => {
      if (user) {
        const friend = await firestore.findFriend(code);
        if (friend) {
          await firestore.addFriend(user, friend);
          return friend.name ?? friend.email ?? friend.id;
        }
        throw new Error("Friend not found");
      }
      throw new Error("Not signed in");
    },
    [user]
  );

  const requestFriendCode = useCallback(async () => {
    if (user) {
      const code = generateFriendCode(user.id);
      await firestore.addFriendCode(code);
      setFriendCode(code);
    } else {
      throw new Error("Not logged in");
    }
  }, [user]);

  const login = useCallback(async (interactive: boolean) => {
    setAuthLoading(true);
    try {
      const token = await getToken(interactive);
      setUser(await firebaseApp.login(token));
      await chrome.storage.local.set({ loggedIn: true });
    } catch (e) {
      if (JSON.stringify(e).includes("FirebaseError")) {
        try {
          Logging.info('Refreshing auth token.')
          const token = await refreshToken(interactive);
          setUser(await firebaseApp.login(token));
          await chrome.storage.local.set({ loggedIn: true });
        } catch (e) {
          Logging.error("Auth refresh failed: ", e);
        }
      } else {
        Logging.error("Login failed: ", e);
      }
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = async () => {
    setUser(null);
    await chrome.storage.local.set({ loggedIn: false });
  };

  useEffect(() => {
    refreshGameInfo();
    if (user) {
      Promise.all([
        async () => {
          if (guesses) {
            await firestore.updateGuesses(user.id, guesses).catch((e) => {
              Logging.error("Failed to update guesses:", e);
            });
          }
        },
        firestore.retrieveFriends(user.friends).then(setFriends),
      ]).then(() => setAuthLoading(false));

      friendShipListenerUnsubscribe.current?.();
      friendShipListenerUnsubscribe.current =
        firestore.listenForFriendshipUpdates(
          user.id,
          setFriends,
          setFriendRequests
        );
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      firestore.updateGuesses(user.id, guesses).catch(() => {
        Logging.error("Failed to update guesses in Firestore.");
      });
    }
  }, [guesses]);

  useEffect(() => {
    if (loggedIn === true && !user) {
      login(false);
    }
  }, [loggedIn]);

  const classes = useStyles({ on: !gameInfo || authLoading });

  const generateGrid = (info: GameInfo) => {
    if (isExpired(info)) {
      return null;
    } else {
      return generateGridMap(info.answers, guesses.words);
    }
  };

  return (
    <>
      <div className={classes.rootLoading}>
        <div className={classes.loading}>
          <Spinner />
        </div>
      </div>
      {!user && !authLoading && (
        <div className={classes.root}>
          <NavBar login={() => login(true)} />
        </div>
      )}
      {!(!gameInfo || authLoading || !user) && (
        <DataContext.Provider
          value={{
            grid: generateGrid(gameInfo),
            gameInfo,
            guesses: guesses.words,
            user,
            friendCode,
            friends: friends ?? [],
            friendRequests: friendRequests ?? [],
            mutations: {
              addFriend,
              requestFriendCode: requestFriendCode,
              logout,
              acceptFriendRequest,
              removeFriendRequest,
            },
          }}
        >
          {children}
        </DataContext.Provider>
      )}
    </>
  );
};

export default DataProvider;
