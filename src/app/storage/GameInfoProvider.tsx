import { GameInfo, Guesses } from "../../lib/interfaces";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { Logging } from "../../lib/logging";

interface GameInfoData {
  error: boolean;
  gameInfo: GameInfo | null;
  guesses: Guesses;
  refreshGameInfo: () => void;
}

export const GameInfoContext = createContext<GameInfoData>({} as GameInfoData);

const extractGameInfo = (): GameInfo => {
  const prefix = "window.gameData = ";
  const gameInfo = Array.from(document.getElementsByTagName("script"))
    .filter((script) => script.textContent !== null)
    .map((script) => script.textContent!)
    .filter((content) => content.startsWith(prefix))
    .map((content) => content.substring(prefix.length))
    .map((content) => JSON.parse(content))
    .map(({ today }) => today)[0];
  if (gameInfo) {
    return gameInfo;
  } else {
    throw new Error("Game info was undefined");
  }
};

const extractGuesses = (): Guesses => {
  const id = extractGameInfo().id;
  try {
    const guessList = Array.from(document.getElementsByClassName("sb-wordlist-items-pag")[0].children);
    const words = guessList.map(guessLi => (guessLi.children[0] as HTMLDivElement).innerText).map(guess => guess.toLowerCase());
    return { words, id };
  } catch (e) {
    console.error("Failed to parse guesses: ", e);
    return {
      words: [],
      id
    };
  }
}

export const GameInfoProvider: React.FC = ({ children }) => {
  const [guesses, setGuesses] = useState(extractGuesses());
  const [gameInfo, setGameInfo] = useState(extractGameInfo());
  const [error, setError] = useState<boolean>(false);

  const extractAndSetGameInfo = useCallback(() => {
    try {
      const gameInfo = extractGameInfo();
      setGameInfo(gameInfo);
      setError(false);
    } catch (e) {
      setError(true);
      Logging.error("Failed to set game info.");
    }
  }, []);

  const saveGuesses = useCallback(
    (newGuesses: Guesses) => {
      if (guesses.id !== newGuesses?.id ||
        !(
          guesses.words.length === newGuesses.words.length &&
          guesses.words.every((word) => newGuesses.words.includes(word))
        )) {
        setGuesses(newGuesses);
      }
    },
    [guesses]
  );

  useEffect(() => {
    const targetNode = document.getElementsByClassName("sb-wordlist-items-pag")[0];
    const config = { attributes: false, childList: true, subtree: true };
    const callback = () => saveGuesses(extractGuesses());
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    return () => observer.disconnect();
  }, []);


  return (
    <GameInfoContext.Provider
      value={{ gameInfo, error, guesses, refreshGameInfo: extractAndSetGameInfo }}
    >
      {children}
    </GameInfoContext.Provider>
  );
};
