import { GameInfoRequestMessage, Messages } from "../lib/messaging";
import { ChromeStorage } from "../lib/storage";
import { Tabs } from "../lib/tabs";
import { FirebaseApp } from "./firebase";
import { User } from "../lib/interfaces";
import { Logging } from "../lib/logging";

Tabs.onTab(
  ["nytimes.com/puzzles/spelling-bee"],
  Tabs.enableExtension,
  Tabs.disableExtension
);

const firebaseApp = new FirebaseApp();
const firestore = firebaseApp.getFirestore();

firebaseApp.listenForAuthUpdates((user) => {
  Logging.info("Auth update!");
  ChromeStorage.get("guesses").then((guesses) => {
    if (user) {
      ChromeStorage.set("user", { ...user, ...(guesses ? { guesses } : {}) });
    } else {
      ChromeStorage.set("user", null);
    }
  });
});

Messages.listen(async (message) => {
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
      const userWithUpdates = message.guesses
        ? {
            ...user,
            ...{ guesses: message.guesses },
          }
        : user;
      await ChromeStorage.set("user", userWithUpdates);
      await firestore.saveUser(userWithUpdates);
    }
  }
  if (Messages.isGameInfoResponse(message)) {
    await ChromeStorage.set("game-info", message.gameInfo);
  }
  if (Messages.isLogoutRequest(message)) {
    await firebaseApp.logout();
    await ChromeStorage.set("user", null);
  }
});
