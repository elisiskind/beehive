import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface SlideProps {
  enter: boolean;
  left?: boolean;
}

const useStyles = createUseStyles({
  root: {
    position: "absolute",
    height: '100%',
    width: '100%',
    zIndex: ({ enter }: SlideProps) => enter ? 4 : 1,
    transition: 'z-index 1s ease-out',
  },
  slide: {
    width: '100%',
    position: 'relative',
    height: '100%',
    left: ({ enter, left }: SlideProps) => enter ? 0 : (left ? '-100%' : '100%'),
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
