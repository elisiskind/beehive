import { GameInfo, Guesses } from "../lib/interfaces";
import {
  GameInfoResponseMessage,
  GuessesResponseMessage,
  Messages,
} from "../lib/messaging";

export const extractGameInfo = (): GameInfo => {
  const prefix = "window.gameData = ";
  const scripts = document.getElementsByTagName("script");
  for (let i = 0; i < scripts.length; i++) {
    const content = scripts[i].textContent;
    if (content && content.indexOf(prefix) !== -1) {
      return JSON.parse(content.substring(prefix.length));
    }
  }
  throw new Error("Failed to find today's game info");
};

const extractGuesses = (): Guesses => {
  const currentState = localStorage.getItem("sb-today");
  const gameInfo = extractGameInfo();
  if (currentState) {
    return {
      guesses: JSON.parse(currentState).words,
      expiration: gameInfo.expiration,
    };
  } else {
    return {
      guesses: [],
      expiration: extractGameInfo().expiration,
    };
  }
};

const sendGameInfo = () => {
  Messages.send(new GameInfoResponseMessage(extractGameInfo()));
};

const listenForMessages = () => {
  Messages.listen(async (message) => {
    if (Messages.isGameInfoResponse(message)) {
      Messages.send(new GameInfoResponseMessage(extractGameInfo()));
    }
  });
};

const sendGuesses = () => {
  setTimeout(
    () => Messages.send(new GuessesResponseMessage(extractGuesses())),
    100
  );
};

const listenForUserInput = () => {
  window.onkeyup = (e) => {
    if (e.key === "Enter") {
      sendGuesses();
    }
  };

  document
    .getElementsByClassName("hive-action__submit")[0]
    .addEventListener("click", () => {
      setTimeout(() => sendGuesses(), 100);
    });
};

listenForUserInput();
listenForMessages();
sendGameInfo();
sendGuesses();