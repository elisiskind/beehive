import "./Spinner.css";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    height: 360,
    width: 480,
    overflow: "hidden"
  }
})

export const Spinner = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={"loader"} />
    </div>
  );
};