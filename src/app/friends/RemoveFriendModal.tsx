import { Button } from "../components/Button";
import { Logging } from "../../lib/logging";
import { createUseStyles } from "react-jss";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { Spinner } from "../components/spinner";

const useStyles = createUseStyles({
  modalContent: {
    display: "flex",
    flexDirection: "column",
    padding: 16,
    gap: 16,
  },
  modalButtons: {
    display: "flex",
    gap: 16,
    justifyContent: "center",
  },
});

interface RemoveFriendModalProps {
  id: string;
  name?: string;
  cancel: () => void;
  onRemove: () => void;
}

export const RemoveFriendModal = ({
  name,
  id,
  cancel,
  onRemove,
}: RemoveFriendModalProps) => {
  const classes = useStyles();
  const {
    mutations: { removeFriendRequest },
  } = useContext(DataContext);

  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className={classes.modalContent}>
      {loading ? (
        <Spinner/>
      ) : (
        <>
          <div>Are you sure you want to remove {name ?? "this friend"}?</div>
          <div className={classes.modalButtons}>
            <span>
              <Button
                onClick={async () => {
                  setLoading(true);
                  await removeFriendRequest(id);
                  Logging.info("Removing friend");
                  setLoading(false);
                  onRemove();
                }}
              >
                Yes
              </Button>
            </span>
            <span>
              <Button onClick={cancel}>Cancel</Button>
            </span>
          </div>
        </>
      )}
    </div>
  );
};
