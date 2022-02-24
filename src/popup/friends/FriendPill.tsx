import { createUseStyles } from "react-jss";
import { Rank, rankRanking } from "../../lib/interfaces";

const skew = (color?: string) => {
  return {
    background: color ? color : "#ffffff",
    borderRight: "2px solid rgb(247, 218, 33)",
    transform: "skewX(-30deg)",
    "&:before": color
      ? {
          content: "' '",
          padding: "4px 8px",
          left: -8,
          position: "absolute",
          transform: "skewX(30deg)",
          height: "1em",
          background: color,
        }
      : undefined,
  };
};

const useStyles = createUseStyles({
  root: {
    display: "flex",
    overflow: "hidden",
    borderRadius: 4,
    border: "2px solid rgb(247, 218, 33)",
  },
  notStarted: {
    padding: "4px 8px",
    border: "2px solid #dedede",
    borderRadius: 4,
  },
  skew1: ({ rank }: { rank: number }) =>
    skew("hsl(52, 93%, " + (100 - rank * 4.5) + "%)"),
  skew2: skew(),
  inner: {
    transform: "skewX(30deg)",
    padding: "4px 8px",
    display: 'flex',
    gap: 4,
    alignItems: "center"
  },
  score: {
    padding: "4px 8px 4px 16px",
    margin: "0 0 0 -8px",
    background: "#ffffff",
  },
  pangram: {
    height: 14,
    width: 14,
  },
});

interface FriendPillProps {
  rank: Rank;
  wordCount: number;
  score: number;
  pangram: boolean;
}

export const FriendPill = ({
  rank,
  wordCount,
  score,
  pangram,
}: FriendPillProps) => {
  const classes = useStyles({ rank: rankRanking[rank] });

  if (score === 0) {
    return <div className={classes.notStarted}>Not Started</div>;
  }

  return (
    <div className={classes.root}>
      <div className={classes.skew1}>
        <div className={classes.inner}>
            {pangram ? (
              <img
                src={"images/icon_24dp.svg"}
                className={classes.pangram}
                alt={"pangram"}
              />
            ) : (
              <></>
            )}
          <span>{rank}</span>
        </div>
      </div>
      <div className={classes.skew2}>
        <div className={classes.inner}>{wordCount} words</div>
      </div>
      <div className={classes.score}>{score} pts</div>
    </div>
  );
};