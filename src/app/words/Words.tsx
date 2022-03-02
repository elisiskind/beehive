import { useContext } from "react";
import { GameInfoContext } from "../storage/GameInfoProvider";

export const Words = () => {
  const { guesses, gameInfo, error } = useContext(GameInfoContext);

  if (error) {
    return <>
    </>
  }

  return (
    <>
      <div className="sb-wordlist-heading">
        <div className="sb-wordlist-heading-wrap sb-touch-button">
          <div className="sb-wordlist-summary">
            You have found {guesses.length}{" "}
            {guesses.length === 1 ? "word" : "words"}
          </div>
        </div>
      </div>
      <div
        className="sb-wordlist-drawer"
        style={{ height: "calc(100% - 60px)" }}
      >
        <div className="sb-wordlist-pag" style={{ height: "100%" }}>
          <ul className="sb-wordlist-items-pag">
            {guesses.sort().map((guess) => {
              return (
                <li>
                  <span className={"sb-anagram"}>
                    {Array.from(guess).map((letter, index) => {
                      const casedLetter =
                        index === 0
                          ? letter.toUpperCase()
                          : letter.toLowerCase();
                      return letter === gameInfo?.centerLetter ? (
                        <span>
                          <span className="sb-anagram-key">{casedLetter}</span>
                        </span>
                      ) : (
                        <>{casedLetter}</>
                      );
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="sb-kebob" />
        </div>
      </div>
    </>
  );
};