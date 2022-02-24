import { GameInfo, Guesses } from "../lib/interfaces";
import {
  GameInfoResponseMessage,
  GuessesResponseMessage,
  Messages,
} from "../lib/messaging";
import { Logging } from "../lib/logging";
import { ExecutionContext, executionContext } from "../lib/utils";

const removeListeners: (() => void)[] = [];

const extractGameInfo = (): GameInfo => {
  const prefix = "window.gameData = ";
  const gameData = Array.from(document.getElementsByTagName("script"))
    .filter((script) => script.textContent !== null)
    .map((script) => script.textContent!)
    .filter((content) => content.startsWith(prefix))
    .map((content) => content.substring(prefix.length))
    .map((content) => JSON.parse(content))
    .map((gameData) => gameData.today)[0];
  if (gameData) {
    return gameData;
  } else {
    throw new Error("Game info was undefined");
  }
};

const extractGuesses = (): Guesses | null => {
  const currentState = localStorage.getItem("sb-today");
  return currentState ? JSON.parse(currentState) : null;
};

const disconnect = () => {
  Logging.info("Disconnecting content script:");
  while (removeListeners.length > 0) {
    removeListeners.pop()?.();
  }
};

const sendGameInfo = async () => {
  const gameInfo = await extractGameInfo();
  Logging.info("Sending info: ", gameInfo);
  Messages.send(new GameInfoResponseMessage(gameInfo));
};

const listenForMessages = () => {
  return Messages.listen(async (message) => {
    if (
      Messages.isGameInfoRequest(message) ||
      Messages.isLoginRequest(message)
    ) {
      Logging.info("Received game info request.");
      try {
        await sendGameInfo();
      } catch (e) {
        if ((e as Error).message.includes("Extension context invalidated")) {
          disconnect();
        } else {
          Logging.error("Error sending game info", {
            message: "hello",
            error: JSON.stringify(e),
          });
        }
      }
    }
  });
};

const sendGuesses = () => {
  const guesses = extractGuesses();
  if (guesses) {
    setTimeout(() => {
      try {
        Messages.send(new GuessesResponseMessage(guesses));
      } catch (e) {
        if ((e as Error).message.includes("Extension context invalidated")) {
          disconnect();
        } else {
          Logging.error("Error sending guesses", e);
        }
      }
    }, 100);
  }
};

const listenForUserInput = () => {
  const submitCallback = () => sendGuesses();
  const keyPressCallback = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      sendGuesses();
    }
  };

  window.addEventListener("keyup", keyPressCallback);
  const submitButton = document.getElementsByClassName(
    "hive-action__submit"
  )[0];
  submitButton?.addEventListener("click", submitCallback);

  return () => {
    submitButton.removeEventListener("click", submitCallback);
    window.removeEventListener("keyup", keyPressCallback);
  };
};

if (executionContext() === ExecutionContext.CONTENT_SCRIPT) {
  Logging.info("Initiating listeners");
  removeListeners.push(listenForUserInput());
  removeListeners.push(listenForMessages());
  sendGuesses();
}