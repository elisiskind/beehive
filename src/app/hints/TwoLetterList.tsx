import { useContext } from "react";
import { DataContext } from "../storage/DataProvider";
import { createUseStyles } from "react-jss";

type WordsByFirstLetter = { [key: string]: string[] };
type CountByTwoLetter = { [key: string]: number };

const useStyles = createUseStyles({
  root: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  line: {
   whiteSpace: "nowrap"
  }
})

export const TwoLetterList = () => {
  const classes = useStyles();

  const {
    guesses,
    gameInfo: { answers },
  } = useContext(DataContext);

  const remainingWords = answers
    .filter((answer) => !guesses.includes(answer))
    .sort();

  const twoLetterList = Object.values(
    remainingWords.reduce<WordsByFirstLetter>((prev, word) => {
      const prefix = word.charAt(0);
      return { ...prev, [prefix]: [...(prev[prefix] ?? []), word] };
    }, {})
  ).map((words) => {
    return words.reduce<CountByTwoLetter>((prev, word) => {
      const prefix = word.charAt(0) + word.charAt(1);
      return { ...prev, [prefix]: (prev[prefix] ?? 0) + 1 };
    }, {});
  });

  return (
    <div className={classes.root}>
      {twoLetterList.map((list) => {
        return (
          <div className={classes.line}>
            {Object.entries(list).map(([prefix, count]) => {
              return prefix.toUpperCase() + "-" + count;
            }).join(' ')}
          </div>
        );
      })}
    </div>
  );
};