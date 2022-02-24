import { createUseStyles } from "react-jss";

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

interface LoginProps {
  login: () => void;
}

export const Login = ({login}: LoginProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      Login to share spelling bee score with friends.
      <button className={classes.button} onClick={login}>
        Login
      </button>
    </div>
  );
};
