import { GameInfo, Guesses } from "../../lib/interfaces";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { isExpired } from "../../lib/utils";
import { Logging } from "../../lib/logging";
import { Spinner } from "../components/spinner";

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
    .map((gameData) => gameData.today)[0];
  if (gameInfo) {
    return gameInfo;
  } else {
    throw new Error("Game info was undefined");
  }
};

const extractGuesses = async (): Promise<Guesses | null> => {
  const parseGuesses = (): Guesses | null => {
    const guessesJson = localStorage.getItem("sb-today");
    if (guessesJson) {
      return JSON.parse(guessesJson);
    } else {
      return null;
    }
  };

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(parseGuesses());
      } catch (e) {
        Logging.error("Error extracting guesses: ", e);
        reject(e);
      }
    }, 50);
  });
};

const listenForUserInput = (setGuesses: (guesses: Guesses | null) => void) => {
  const submitCallback = async () => {
    setGuesses(await extractGuesses());
  };
  const keyPressCallback = async (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setGuesses(await extractGuesses());
    }
  };

  window.addEventListener("keyup", keyPressCallback);
  const submitButton = document.getElementsByClassName(
    "hive-action__submit"
  )[0];
  submitButton?.addEventListener("click", submitCallback);

  return () => {
    Logging.info('Removing guesses listeners');
    submitButton.removeEventListener("click", submitCallback);
    window.removeEventListener("keyup", keyPressCallback);
  };
};

export const GameInfoProvider: React.FC = ({ children }) => {
  const [guesses, setGuesses] = useState<Guesses | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [error, setError] = useState<boolean>(false);

  const unsubscribeGuessesRef = useRef<() => void>(() => {
    Logging.debug("no unsubscribe defined");
  });

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
    (newGuesses: Guesses | null) => {
      if (!guesses ||
      guesses.id !== newGuesses?.id ||
      !(
        guesses.words.length === newGuesses.words.length &&
        guesses.words.every((word) => newGuesses.words.includes(word))
      )) {
        setGuesses(newGuesses);
      }
    },
    [unsubscribeGuessesRef, guesses]
  );

  useEffect(() => {
    const unsub = listenForUserInput(saveGuesses);
    unsubscribeGuessesRef.current = unsub;
    return unsub;
  }, []);

  useEffect(() => {
    extractGuesses().then(saveGuesses);
    if (!gameInfo || isExpired(gameInfo)) {
      Logging.info("Extracting game info.");
      extractAndSetGameInfo();
    }
  }, []);

  useEffect(() => {
    if (!gameInfo || isExpired(gameInfo)) {
      Logging.info("Extracting game info.");
      extractAndSetGameInfo();
    }
  }, []);

  if (!gameInfo) {
    return <Spinner/>
  }

  const todaysGuesses =
    {
      id: gameInfo.id,
      words: guesses && guesses.id === gameInfo.id ? guesses.words : []
    }

  return (
    <GameInfoContext.Provider
      value={{ gameInfo, error, guesses: todaysGuesses, refreshGameInfo: extractAndSetGameInfo }}
    >
      {children}
    </GameInfoContext.Provider>
  );
};
