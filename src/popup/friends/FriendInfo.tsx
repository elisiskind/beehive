import { User } from "../../lib/interfaces";
import { createUseStyles } from "react-jss";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { getLevel, getScore } from "./scoring";
import { ScoreDifference } from "./ScoreDifference";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Messages, RemoveFriendRequestMessage } from "../../lib/messaging";

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
    background: "#8abdff",
    padding: 4,
    borderRadius: 4,
  },
  details: {
    maxHeight: ({ expanded }: { expanded: boolean }) =>
      expanded ? "100vh" : "0.01vh",
    transition: "max-height 0.2s ease-in-out",
    overflow: "hidden",
  },
  detailsInner: {
    paddingTop: 16,
  },
  div: {
    borderBottom: "1px solid #dedede",
    margin: "8px 32px",
  },
  infoTitle: {
    fontWeight: "bold",
  },
  removeFriendButtonContainer: {
    textAlign: "center",
    width: "100%",
  },
  removeFriendButton: {
    background: "none",
    color: "#555",
    paddingTop: 16,
    "&:hover": {
      textDecoration: "underline",
      background: "none",
    },
    "&:active": {
      textDecoration: "underline",
      background: "none",
    },
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    padding: 16,
    gap: 16
  },
  modalButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "center"
  }
});

interface FriendInfoProps {
  user: User;
  active: boolean;
  setActive: (id: string | null) => void;
}

export const FriendInfo = ({ user, setActive, active }: FriendInfoProps) => {
  const { gameInfo, guesses: myGuesses } = useContext(DataContext);
  const myScore = getScore(myGuesses, gameInfo.pangrams);
  const guesses = user.guesses[gameInfo.id] ?? [];

  const classes = useStyles({ expanded: active });

  const score = getScore(guesses, gameInfo.pangrams);
  const level = getLevel(score, gameInfo.answers, gameInfo.pangrams);

  const wordsInCommon = guesses.filter((guess) => myGuesses.includes(guess));
  const yourWords = myGuesses.filter((guess) => !guesses.includes(guess));
  const theirWordCount = guesses.filter(
    (guess) => !myGuesses.includes(guess)
  ).length;

  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  const foundPangram = () => {
    for (let pangram of gameInfo.pangrams) {
      if (guesses.includes(pangram)) {
        return true;
      }
    }
  };

  return (
    <>
      {showRemoveModal ? (
        <Modal close={() => setShowRemoveModal(false)} title={"Remove Friend"}>
          <div className={classes.modalContent}>
            <div>
              Are you sure you want to remove{" "}
              {user.name ?? user.email ?? "this friend"}?
            </div>
            <div className={classes.modalButtons}>
              <span>
                <Button
                  onClick={() => {
                    Messages.send(new RemoveFriendRequestMessage(user.id));
                    setShowRemoveModal(false);
                    setActive(null);
                  }}
                >
                  Yes
                </Button>
              </span>
              <span>
                <Button onClick={() => setShowRemoveModal(false)}>
                  Cancel
                </Button>
              </span>
            </div>
          </div>
        </Modal>
      ) : (
        <></>
      )}
      <div
        className={classes.root}
        onClick={() => setActive(active ? null : user.id)}
      >
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
            <ScoreDifference myScore={myScore} theirScore={score} />
          </div>
          <div className={classes.level}>
            {level}
            {foundPangram() ? "*" : ""}
          </div>
        </div>
        <div className={classes.details}>
          <div className={classes.detailsInner}>
            <div>
              {guesses.length} words, {score} points
            </div>
            <div className={classes.div} />
            {wordsInCommon.length > 0 ? (
              <div>
                <div className={classes.infoTitle}>
                  You both got these words:
                </div>
                <div>{wordsInCommon.join(", ")}</div>
              </div>
            ) : (
              <div className={classes.infoTitle}>
                You haven't found any words in common yet.
              </div>
            )}
            <div className={classes.div} />
            {yourWords.length > 0 ? (
              <div>
                <div className={classes.infoTitle}>
                  You've found these words that they haven't found:
                </div>
                <div>{yourWords.join(", ")}</div>
              </div>
            ) : (
              <div className={classes.infoTitle}>
                You haven't found any words that they haven't found.
              </div>
            )}
            <div className={classes.div} />
            {theirWordCount > 0 ? (
              <div>
                <div className={classes.infoTitle}>
                  They've found {theirWordCount} words that you haven't found.
                </div>
              </div>
            ) : (
              <div className={classes.infoTitle}>
                They haven't found any words that you haven't found.
              </div>
            )}
            <div className={classes.removeFriendButtonContainer}>
              <Button
                className={classes.removeFriendButton}
                size={"small"}
                onClick={() => {
                  setShowRemoveModal(true);
                }}
              >
                Remove friend
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
