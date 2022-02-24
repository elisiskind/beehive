import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface SlideProps {
  enter: boolean;
  left?: boolean;
}

const useStyles = createUseStyles({
  root: {
  },
  slide: {
    width: 480,
    position: "absolute",
    left: ({ enter, left }: SlideProps) => enter ? 0 : (left ? -480 : 480),
    transition: 'left 0.4s ease-in-out',
  }
});

export const Slide: FunctionComponent<SlideProps> = ({ enter, left, children }) => {
  const classes = useStyles({ enter, left });

  return (

    <div className={classes.root}>
      <div className={classes.slide}>{children}</div>
    </div>
  );
};
