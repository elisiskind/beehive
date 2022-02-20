import { GameInfo, Guesses } from "../lib/interfaces";
import {
  GameInfoResponseMessage,
  GuessesResponseMessage,
  Messages,
} from "../lib/messaging";
import { Logging } from "../lib/logging";

const extractGameInfo = () => {
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
    throw new Error("Failed to find today's game info");
  }
};

const extractGuesses = (): Guesses | null => {
  const currentState = localStorage.getItem("sb-today");
  return currentState ? JSON.parse(currentState) : null;
};

const sendGameInfo = async () => {
  Messages.send(new GameInfoResponseMessage(await extractGameInfo()));
};

const listenForMessages = () => {
  Messages.listen(async (message) => {
    if (
      Messages.isGameInfoRequest(message) ||
      Messages.isLoginRequest(message)
    ) {
      sendGameInfo().catch(e => {
        Logging.error('Failed to respond with game info: ', e)
      });
    }
  });
};

const sendGuesses = () => {
  const guesses = extractGuesses();
  if (guesses) {
    setTimeout(
      () => Messages.send(new GuessesResponseMessage(guesses)),
      100
    );
  }
};

const listenForUserInput = () => {
  window.onkeyup = (e) => {
    if (e.key === "Enter") {
      sendGuesses();
    }
  };

  document
    .getElementsByClassName("hive-action__submit")[0]
    ?.addEventListener("click", () => {
      setTimeout(() => sendGuesses(), 100);
    });
};

listenForUserInput();
listenForMessages();
sendGuesses();