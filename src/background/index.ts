import {
  AddFriendResponseMessage,
  GameInfoRequestMessage,
  Messages,
} from "../lib/messaging";
import { ChromeStorage } from "../lib/storage";
import { Tabs } from "../lib/tabs";
import { FirebaseApp } from "./firebase";
import { User } from "../lib/interfaces";
import { generateFriendCode } from "./friends";
import { Logging } from "../lib/logging";
import { Unsubscribe } from "@firebase/firestore";
import { User as FirebaseUser } from "@firebase/auth";

Tabs.onTab(
  ["nytimes.com/puzzles/spelling-bee"],
  Tabs.enableExtension,
  Tabs.disableExtension
);

const firebaseApp = new FirebaseApp();
const firestore = firebaseApp.getFirestore();

let friendShipListenerUnsubscribe: Unsubscribe | null = null;

// Create a new user, and initialize with current guesses if necessary
const createUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  return {
    name: firebaseUser.displayName,
    photo: firebaseUser.photoURL,
    id: firebaseUser.uid,
    email: firebaseUser.email,
    friends: [],
    guesses: {},
  };
};

firebaseApp.listenForAuthUpdates(async (user) => {
  try {
    await ChromeStorage.set("user", user);
    if (user) {
      ChromeStorage.get("guesses").then((guesses) => {
        if (guesses) {
          firestore.updateGuesses(user.id, guesses);
        }
      });

      const friends = (
        await Promise.all(
          user.friends.map((friendId) => {
            return firestore.retrieveUser(friendId);
          })
        )
      ).filter((user) => user != null) as User[];
      await ChromeStorage.set("friends", friends);

      friendShipListenerUnsubscribe = firestore.listenForFriendshipUpdates(
        user.id,
        async (updatedFriend) => {
          const friends = await ChromeStorage.get("friends");
          const updatedFriends = friends?.map((friend) => {
            if (friend.id === updatedFriend.id) {
              return updatedFriend;
            } else {
              return friend;
            }
          }) ?? [updatedFriend];
          await ChromeStorage.set("friends", updatedFriends);
        },
        (friendRequests) => {
          ChromeStorage.set("friend-requests", friendRequests);
        }
      );
    } else {
      friendShipListenerUnsubscribe?.();
    }
  } catch (e) {
    Logging.error("Failed to handle auth change.", user, e);
  }
}, createUser);

Messages.listen(async (message) => {
  try {
    if (Messages.isLoginRequest(message)) {
      Messages.send(
        new GameInfoRequestMessage(),
        "nytimes.com/puzzles/spelling-bee"
      );
      await firebaseApp.login();
    }
    if (Messages.isGuessesResponse(message)) {
      await ChromeStorage.set("guesses", message.guesses);
      const user: User | null = await ChromeStorage.get("user");
      if (user) {
        await firestore.updateGuesses(user.id, message.guesses);
      }
    }
    if (Messages.isGameInfoResponse(message)) {
      await ChromeStorage.set("game-info", message.gameInfo);
    }
    if (Messages.isLogoutRequest(message)) {
      await firebaseApp.logout();
      await ChromeStorage.set("user", null);
    }
    if (Messages.isGenerateFriendCodeRequest(message)) {
      const user: User | null = await ChromeStorage.get("user");
      if (user) {
        Logging.info("Generating friend code for user: ", user.id);
        const code = generateFriendCode(user.id);
        Logging.info("Friend code: ", code);
        await firestore.addFriendCode(code);
        await ChromeStorage.set("friend-code", code);
      }
    }
    if (Messages.isAcceptFriendRequest(message)) {
      const user: User | null = await ChromeStorage.get("user");
      if (user) {
        await firestore.acceptFriendRequest(message.id, user.id);
      }
    }
    if (Messages.isAddFriendRequest(message)) {
      try {
        const user: User | null = await ChromeStorage.get("user");
        if (user) {
          const friend = await firestore.findFriend(message.code);
          if (friend) {
            await firestore.addFriend(user, friend);
          }
          Messages.send(
            new AddFriendResponseMessage(
              friend?.name ?? friend?.email ?? friend?.id
            )
          );
        } else {
          Messages.send(new AddFriendResponseMessage());
        }
      } catch (e) {
        Logging.error("Failed to add friend code", e);
        Messages.send(new AddFriendResponseMessage());
      }
    }
    if (Messages.isRemoveFriendRequest(message)) {
      const user: User | null = await ChromeStorage.get("user");
      if (user) {
        await firestore.removeFriend(user.id, message.id);
      }
    }
  } catch (e) {
    Logging.error("Failed to handle message: ", message, e);
  }
});
