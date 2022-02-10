import { createUseStyles } from "react-jss";
import "firebase/compat/auth";
import { useContext } from "react";
import { DataContext } from "./DataProvider";

const useStyles = createUseStyles({
  root: {
    padding: 32,
    width: "40%",
    minWidth: 240,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  button: {
    outline: "none",
    border: "none",
    padding: 16,
    borderRadius: 8,
    background: "#f7da21",
    cursor: "pointer",

    "&:hover": {
      background: "#e7ca11",
    },
  },
});

export const Login = () => {
  const classes = useStyles();
  const { login } = useContext(DataContext);

  return (
    <div className={classes.root}>
      Login to share spelling bee score with friends.
      <button className={classes.button} onClick={login}>
        Login
      </button>
    </div>
  );
};
