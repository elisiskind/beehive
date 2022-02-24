import {
  AddFriendResponseMessage,
  GameInfoRequestMessage,
  Messages,
} from "../lib/messaging";
import { ChromeStorage } from "../lib/storage";
import { FirebaseApp } from "./firebase";
import { User } from "../lib/interfaces";
import { generateFriendCode } from "./friends";
import { Logging } from "../lib/logging";
import { Unsubscribe } from "@firebase/firestore";
import { Tabs } from "../lib/tabs";
import { ExecutionContext, executionContext } from "../lib/utils";

Tabs.onTab(
  ["nytimes.com/puzzles/spelling-bee"],
  Tabs.enableExtension,
  Tabs.disableExtension
);

const firebaseApp = new FirebaseApp();
const firestore = firebaseApp.getFirestore();

let friendShipListenerUnsubscribe: Unsubscribe | null = null;

const onSignIn = async (user: User) => {
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
  friendShipListenerUnsubscribe?.();
  friendShipListenerUnsubscribe = firestore.listenForFriendshipUpdates(
    user.id,
    async (friends) => {
      await ChromeStorage.set("friends", friends);
    },
    async (friendRequests) => {
      await ChromeStorage.set("friend-requests", friendRequests);
    }
  );
  await ChromeStorage.set("user", user);
};

Messages.listen(async (message) => {
  if (executionContext() !== ExecutionContext.BACKGROUND) {
    return;
  }
  const user = firebaseApp.currentUser();
  try {
    if (Messages.isListenToFriendsRequest(message)) {
      if (user) {
        await onSignIn(user);
      }
    }
    if (Messages.isLoginRequest(message)) {
      try {
        await onSignIn(user || (await firebaseApp.login()));
      } catch (e) {
        Logging.error("Login failed: ", e);
        await ChromeStorage.set(
          "login-failed-message",
          "Error logging in. Please try again later."
        );
      }
      Messages.send(
        new GameInfoRequestMessage(),
        "nytimes.com/puzzles/spelling-bee"
      );
    }
    if (Messages.isGuessesResponse(message)) {
      // Check if guesses value has actually changed
      const oldGuesses = await ChromeStorage.get("guesses");
      if (
        !oldGuesses ||
        oldGuesses.id !== message.guesses.id ||
        !(
          oldGuesses.words.length === message.guesses.words.length &&
          oldGuesses.words.every((word) => message.guesses.words.includes(word))
        )
      ) {
        // If we are signed in, store it
        if (user) {
          await firestore.updateGuesses(user.id, message.guesses);
        }
        await ChromeStorage.set("guesses", message.guesses);
      }
    }
    if (Messages.isGameInfoResponse(message) && message.gameInfo) {
      await ChromeStorage.set("game-info", message.gameInfo);
    }
    if (Messages.isLogoutRequest(message)) {
      friendShipListenerUnsubscribe?.();
      await ChromeStorage.set("user", null);
      await firebaseApp.logout();
    }
    if (Messages.isGenerateFriendCodeRequest(message)) {
      if (user) {
        const code = generateFriendCode(user.id);
        await firestore.addFriendCode(code);
        await ChromeStorage.set("friend-code", code);
      }
    }
    if (Messages.isAcceptFriendRequest(message)) {
      if (user) {
        await firestore.acceptFriendRequest(message.id, user.id);
      }
    }
    if (Messages.isAddFriendRequest(message)) {
      try {
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
      if (user) {
        await firestore.removeFriend(user.id, message.id);
      }
    }
  } catch (e) {
    Logging.error("Failed to handle message: ", message, e);
  }
});

chrome.runtime.onSuspend.addListener(() => {
  Logging.debug("Suspending...");
  friendShipListenerUnsubscribe?.(); // stop listening for updates
});

chrome.runtime.onInstalled.addListener(async () => {
  (chrome.runtime.getManifest().content_scripts ?? [])
    .filter(
      (cs): cs is { js: string[]; matches: string[] } => !!cs.js && !!cs.matches
    )
    .forEach((cs) => {
      chrome.tabs.query({ url: cs.matches }).then((tabs) => {
        tabs
          .map((tab) => tab.id)
          .filter((id): id is number => !!id)
          .forEach((id) => {
            chrome.scripting.executeScript({
              target: { tabId: id },
              files: cs.js,
            });
          });
      });
    });
});