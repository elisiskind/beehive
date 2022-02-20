import { User } from "../../lib/interfaces";
import { createUseStyles } from "react-jss";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { getLevel, getScore } from "./scoring";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 16,
    transition: "gap 0.2s ease-in-out",
    cursor: "pointer",
    borderRadius: 8,

    "&:hover": {
      background: "#efefef",
    },
  },
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profile: {
    height: 24,
    width: 24,
    borderRadius: "50%",
  },
  profileInfo: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4,
  },
  level: {
    background: '#8abdff',
    padding: 4,
    borderRadius: 4
  },
  details: {
    maxHeight: ({ expanded }: { expanded: boolean }) =>
      expanded ? "100vh" : "0.01vh",
    transition: "max-height 0.2s ease-in-out",
    overflow: "hidden",
  },
  detailsInner: {
    paddingTop: 16
  }
});

interface FriendInfoProps {
  user: User;
}

export const FriendInfo = ({ user }: FriendInfoProps) => {
  const { gameInfo, guesses: myGuesses } = useContext(DataContext);
  const guesses = user.guesses[gameInfo.id] ?? [];
  const [expand, setExpand] = useState<boolean>(false);

  const classes = useStyles({ expanded: expand });

  const score = getScore(guesses, gameInfo.pangrams);
  const level = getLevel(score, gameInfo.answers, gameInfo.pangrams);

  const wordsInCommon = guesses.filter((guess) => myGuesses.includes(guess));
  const foundPangram = () => {
    for (let pangram of gameInfo.pangrams) {
      if (guesses.includes(pangram)) {
        return true;
      }
    }
  }

  return (
    <div className={classes.root} onClick={() => setExpand(!expand)}>
      <div className={classes.bar}>
        <div className={classes.profileInfo}>
          <img
            className={classes.profile}
            src={
              user.photo ??
              "https://lh3.googleusercontent.com/pw/AM-JKLUfpoZSOE0mrMYpnEOaG_zlGQOwyPnheqPbUEBC7URlVTPd-0k7UKkxN0-ssDfR8omPLt2xrqx3qJgQQ5rzySrCtNPRxs1lWhU0L3bb9Znu2t9ycLWgt382zJ17vjR8m2hf4Rj5Wzdm9E-c-D8zP3316A=w990-h934-no?authuser=0"
            }
            alt={"profile"}
          />
          <div>{user.name ?? user.email}</div>
        </div>
        <div className={classes.level}>{level}{foundPangram() ? '*' : ''}</div>
      </div>
      <div className={classes.details}>
        <div className={classes.detailsInner}>
          <div>
            {guesses.length} words, {score} points
          </div>
          {wordsInCommon.length > 0 ? (
            <div>
              <div>You both got these words:</div>
              <div>{wordsInCommon.join(", ")}</div>
            </div>
          ) : (
            <div>You haven't found any words in common yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};
