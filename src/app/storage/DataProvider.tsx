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
import { Words } from "../words/Words";
import { firebaseApp, firestore } from "../index";
import { Logging } from "../../lib/logging";
import { Unsubscribe } from "@firebase/firestore";
import { generateFriendCode } from "../firebase/friends";
import { AuthRequest, Messages } from "../../lib/messaging";

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
  const classes = useStyles();

  const { guesses, gameInfo, error, refreshGameInfo } =
    useContext(GameInfoContext);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<FriendCode | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[] | null>(null);
  const [friendRequests, setFriendRequests] = useState<User[] | null>(null);
  const [loginFailedMessage, setLoginFailedMessage] = useState<string>();
  const friendShipListenerUnsubscribe = useRef<Unsubscribe | null>(null);

  const onSignIn = useCallback(
    async (loggedInUser: User) => {
      setUser(loggedInUser);
    },
    [guesses]
  );

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

  const login = useCallback(async () => {
    setAuthLoading(true);
    try {
      Messages.send(new AuthRequest());
    } catch (e) {
      Logging.error("Failed to send auth request: ", e);
    }
  }, [user]);

  const logout = useCallback(async () => {
    friendShipListenerUnsubscribe.current?.();
    setUser(null);
    setAuthToken(null);
    await firebaseApp.logout();
  }, [friendShipListenerUnsubscribe]);

  useEffect(() => {
      if (!user) {
        Messages.send(new AuthRequest(true))
      }
    }, [user]);

  // Initialize user from firebase
  useEffect(() => {
    setUser(firebaseApp.currentUser());
  }, []);

  // Listen for token response
  useEffect(() => {
    return Messages.listen((message) => {
      if (Messages.isAuthResponse(message)) {
        if (message.token) {
          setAuthToken(message.token);
        } else {
          setLoginFailedMessage("Login failed.");
        }
      }
      return Promise.resolve();
    });
  }, []);

  // Attempt sign in once token is received
  useEffect(() => {
    if (authToken) {
      firebaseApp
        .login(authToken)
        .then(onSignIn)
        .catch((e) => {
          Logging.error("Login failed: ", e);
          setLoginFailedMessage("Error logging in. Please try again later.");
        });
    }
  }, [authToken]);

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
      firestore.updateGuesses(user.id, guesses).catch((e) => {
        Logging.error("Failed to update guesses in Firestore.");
      });
    }
  }, [guesses]);

  if (!user && !authLoading) {
    return (
      <div className={classes.root}>
        <NavBar login={login} />
        <Words />
      </div>
    );
  }

  if (!gameInfo || authLoading || !user) {
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
      return generateGridMap(gameInfo.answers, guesses.words);
    }
  };

  return (
    <DataContext.Provider
      value={{
        grid: generateGrid(),
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
  );
};

export default DataProvider;
