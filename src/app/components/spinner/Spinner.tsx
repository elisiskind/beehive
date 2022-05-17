import "./Spinner.css";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    height: '100%',
    width: '100%',
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