import { FC } from "react";
import { createUseStyles } from "react-jss";
import { Button } from "./Button";
import { CloseIcon } from "./icons/CloseIcon";

const useStyles = createUseStyles({
  root: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    zIndex: 5,
    background: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "80%",
    maxWidth: "480px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "white",
    borderRadius: 4,
    boxShadow: "0 0 5px 5px rgba(0, 0, 0, 20%)",
    zIndex: 100,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  closeButton: {
    height: "3em",
    width: "3em",
    minWidth: "3em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    paddingLeft: 8,
  },
});

interface ModalProps {
  close: () => void;
  title: string;
}

export const Modal: FC<ModalProps> = ({ close, title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.root} onClick={close}>
      <div className={classes.modal} onClick={(e) => e.stopPropagation()}>
        <div className={classes.topBar}>
          <div className={classes.title}>{title}</div>
          <Button className={classes.closeButton} onClick={close}>
            <div>
              <CloseIcon size={24} />
            </div>
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
};
