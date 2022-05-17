import { Grid } from "./Grid";
import { TwoLetterList } from "./TwoLetterList";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    fontFamily: 'nyt-imperial, georgia, "times new roman", times, serif',
    gap: 24,
    alignItems: 'center'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: "center"
  },
  title: {
    fontWeight: 800,
    marginTop: 16
  },
  link: {
    fontStyle: 'italic',
    cursor: "pointer",
    color: "#326891"
  }
});

export const Hints = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.section}>
        <h2  className={classes.title}>Grid</h2>
        <Grid />
      </div>
      <div className={classes.section}>
        <h2  className={classes.title}>Two Letter List</h2>
        <TwoLetterList />
      </div>
      <div>
        <a
          href={
            "https://www.nytimes.com/2021/07/26/crosswords/spelling-bee-forum-introduction.html"
          }
          className={classes.link}
        >
          How to read these hints
        </a>
      </div>
    </div>
  );
};
