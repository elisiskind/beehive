import { createUseStyles } from "react-jss";
import { Button } from "../components/Button";
import { useContext, useEffect, useRef, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { isExpired } from "../../lib/utils";
import { Spinner } from "../components/spinner";
import { Modal } from "../components/Modal";
import { Logging } from "../../lib/logging";

const useStyles = createUseStyles({
  content: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    paddingTop: 4,
  },
  input: {
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: ".5px",
    textRendering: "optimizeLegibility",
    lineHeight: 1.25,
    height: "1.25em",
    fontSize: "2em",
    paddingTop: "2px",
    textAlign: "center",
    width: "100%",
    outline: "none",
    border: "none",
    background: "#eee",
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
});

interface AddFriendProps {
  close: () => void;
}

export const AddFriend = ({ close }: AddFriendProps) => {
  const classes = useStyles();

  const {
    friendCode,
    mutations: { requestFriendCode, addFriend },
  } = useContext(DataContext);
  const loading = !friendCode || isExpired(friendCode);
  const [codeToAdd, setCodeToAdd] = useState<string | null>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!friendCode) {
      requestFriendCode();
    }
  }, [friendCode]);

  const add = async () => {
    const code = codeToAdd;
    if (code) {
      setCodeToAdd(null);
      try {
        const resp = await addFriend(code);
        setMessage(`Added ${resp}`);
      } catch (e) {
        setError("Invalid code.");
        Logging.error(`Failed to add friend for ${code}`, e);
      }
    }
  };

  return (
    <Modal close={close} title={"Add friend"}>
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
            {message ? <div className={classes.message}>{message}</div> : <></>}
          </div>
        </div>
      )}
    </Modal>
  );
};