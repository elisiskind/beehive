import { createUseStyles } from "react-jss";
import { Button } from "../components/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { isExpired } from "../../lib/utils";
import {
  AddFriendRequestMessage,
  GenerateFriendCodeRequestMessage,
  Messages,
} from "../../lib/messaging";
import { Spinner } from "../components/spinner";

const useStyles = createUseStyles({
  root: {
    position: "fixed",
    width: 360,
    height: "100%",
    top: 0,
    zIndex: 99,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "white",
    borderRadius: 4,
    boxShadow: "0 0 5px 5px rgba(0, 0, 0, 20%)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 4,
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    background: "#4081f7",
    outline: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: 4,

    "&:hover": {
      background: "#3071e7",
    },
    "&:active": {
      background: "#2061d7",
    },
  },
  content: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    gap: 8,
  },
  input: {
    textAlign: "center",
    flex: 1,
    borderRadius: 4,
    outline: "none",
    border: "1px solid #d0d0d0",
    height: 37,
  },
  error: {
    color: "#D74030",
    paddingTop: 8,
  },
  message: {
    paddingTop: 8,
  },
  divider: {
    textAlign: "center",
  },
  button: {
    width: 75,
  },
  title: {
    fontSize: 18,
    paddingLeft: 8,
  },
});

interface AddFriendProps {
  close: () => void;
}

export const AddFriend = ({ close }: AddFriendProps) => {
  const classes = useStyles();

  const { friendCode } = useContext(DataContext);
  const loading = !friendCode || isExpired(friendCode);
  const [codeToAdd, setCodeToAdd] = useState<string | null>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      Messages.send(new GenerateFriendCodeRequestMessage());
    }
  }, [loading]);

  useEffect(() => {
    return Messages.listen((resp) => {
      if (Messages.isAddFriendResponse(resp)) {
        if (resp.name) {
          setMessage("Added " + resp.name);
        } else {
          setError("Invalid code.");
        }
      }
    })
  }, []);

  const add = () => {
    const code = codeToAdd;
    if (code) {
      setCodeToAdd(null);
      Messages.send(new AddFriendRequestMessage(code));
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.modal}>
        <div className={classes.topBar}>
          <div className={classes.title}>Add a friend</div>
          <button className={classes.closeButton} onClick={close}>
            X
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className={classes.content}>
            <div>
              Click to copy friend code:
              <div className={classes.row}>
                <input
                  className={classes.input}
                  contentEditable={false}
                  onClick={() => {
                    inputRef.current?.select();
                    navigator.clipboard.writeText(friendCode?.code);
                    setMessage("Copied code");
                  }}
                  value={friendCode?.code}
                  ref={inputRef}
                />
              </div>
            </div>
            <div>
              <div className={classes.divider}>OR</div>
            </div>
            <div>
              Paste friend code here:
              <div className={classes.row}>
                <input
                  className={classes.input}
                  onChange={(e) =>
                    setCodeToAdd(e.target.value.substring(0, 6).toUpperCase())
                  }
                  value={codeToAdd ?? ""}
                  onClick={() => {
                    setError(null);
                    setMessage(null);
                  }}
                />
                <Button
                  className={classes.button}
                  disabled={codeToAdd?.length !== 6}
                  size={"medium"}
                  onClick={add}
                >
                  Add
                </Button>
              </div>
              {error ? <div className={classes.error}>{error}</div> : <></>}
              {message ? (
                <div className={classes.message}>{message}</div>
              ) : (
                <></>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};