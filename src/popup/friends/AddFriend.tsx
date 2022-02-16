import { createUseStyles } from "react-jss";
import { Button } from "../components/Button";

const useStyles = createUseStyles({
  root: {
    position: "fixed",
    width: 360,
    height: 360,
    zIndex: 99,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "white",
    borderRadius: 8,
  },
  topBar: {
    display: "flex",
    alignItems: "end",
  },
  closeButton: {
    background: "#f78081",
    outline: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    borderRadius: 8,

    "&:hover": {
      background: "#e77071",
    },
    "&:active": {
      background: "#d76061",
    },
  },
});

interface AddFriendProps {
  close: () => void;
}

export const AddFriend = ({ close }: AddFriendProps) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <div className={classes.topBar}>
          <button className={classes.closeButton} onClick={close}>
            X
          </button>
        </div>
        <div>
          <input contentEditable={false}>
            FRIEND CODE GOES HERE
          </input>
          <Button onClick={() => {}}>
            Copy friend code
          </Button>
        </div>
      </div>
    </div>
  );
};