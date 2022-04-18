import { createUseStyles } from "react-jss";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { Button } from "../components/Button";
import { LeaderBoardFriend } from "./Leaderboard";
import { Modal } from "../components/Modal";
import { FriendPill } from "./FriendPill";
import { RemoveFriendModal } from "./RemoveFriendModal";

interface StyleProps {
  expanded: boolean;
  isMe: boolean;
}

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
    border: ({ isMe }: StyleProps) => (isMe ? "2px solid #f7da21" : "none"),
  },
  profileInfo: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    fontWeight: ({ isMe }: StyleProps) => (isMe ? "bold" : "normal"),
    gap: 4,
  },
  level: {
    background: "#8abdff",
    padding: 4,
    borderRadius: 4,
  },
  details: {
    maxHeight: ({ expanded }: StyleProps) => (expanded ? "100vh" : "0.01vh"),
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
    paddingBottom: 4,
  },
  removeFriendButtonContainer: {
    textAlign: "center",
    width: "100%",
  },
  removeFriendButton: {
    background: "none",
    outline: "none",
    border: "none",
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
});

interface FriendInfoProps extends LeaderBoardFriend {
  active: boolean;
  setActive: (id: string | null) => void;
}

export const FriendInfo = ({
  id,
  name,
  score,
  rank,
  pangram,
  guesses,
  setActive,
  active,
  photo,
  isMe,
}: FriendInfoProps) => {
  const { guesses: myGuesses } = useContext(DataContext);

  const classes = useStyles({ expanded: active, isMe });

  const wordsInCommon = guesses.filter((guess) => myGuesses.includes(guess));
  const yourWords = myGuesses.filter((guess) => !guesses.includes(guess));
  const theirWordCount = guesses.filter(
    (guess) => !myGuesses.includes(guess)
  ).length;

  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);

  const removeFriend = (
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
  );

  const details = (
    <div className={classes.details}>
      <div className={classes.detailsInner}>
        {isMe ? (
          <>
            <div className={classes.div} />
            <div>
              <div className={classes.infoTitle}>
                You found {guesses.length}{" "}
                {guesses.length === 1 ? "word" : "words"}.
              </div>
              <div>{guesses.join(", ")}</div>
            </div>
          </>
        ) : score === 0 ? (
          removeFriend
        ) : (
          <>
            {wordsInCommon.length > 0 ? (
              <div>
                <div className={classes.infoTitle}>
                  You found {wordsInCommon.length}{" "}
                  {wordsInCommon.length === 1 ? "word" : "words"} in common.
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
                  You've found {yourWords.length}{" "}
                  {yourWords.length === 1 ? "word" : "words"} that they haven't
                  found:
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
                  They've found {theirWordCount}{" "}
                  {theirWordCount === 1 ? "word" : "words"} that you haven't
                  found.
                </div>
              </div>
            ) : (
              <div className={classes.infoTitle}>
                They haven't found any words that you haven't found.
              </div>
            )}
            {removeFriend}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {showRemoveModal ? (
        <Modal close={() => setShowRemoveModal(false)} title={"Remove Friend"}>
          <RemoveFriendModal
            name={name}
            id={id}
            cancel={() => {
              setShowRemoveModal(false);
            }}
            onRemove={() => {
              setShowRemoveModal(false);
              setActive(null);
            }}
          />
        </Modal>
      ) : (
        <></>
      )}
      <div
        className={classes.root}
        onClick={() => setActive(active ? null : id)}
      >
        <div className={classes.bar}>
          <div className={classes.profileInfo}>
            <img className={classes.profile} src={photo} alt={"profile"} />
            <div>
              {name}
              {isMe ? " (you)" : ""}
            </div>
          </div>
          <FriendPill
            rank={rank}
            wordCount={guesses.length}
            score={score}
            pangram={pangram}
          />
        </div>
        {details}
      </div>
    </>
  );
};
