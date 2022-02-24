import { FC } from "react";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    position: "fixed",
    width: 480,
    height: "100%",
    top: 0,
    left: 0,
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
    zIndex: 100
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
  title: {
    fontSize: 18,
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
          <button className={classes.closeButton} onClick={close}>
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
