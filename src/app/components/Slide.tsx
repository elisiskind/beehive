import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface SlideProps {
  enter: boolean;
  left?: boolean;
}

const useStyles = createUseStyles({
  root: {
    position: "absolute",
    height: "calc(var(--vh, 1vh) * 64 + 60px);",
    width: "100%",
    visibility: ({ enter }: SlideProps) => (enter ? "visible" : "hidden"),
    transition: "visibility 0.3s ease-out, background 0.3s ease-in-out",
    background: ({ enter }: SlideProps) =>
      enter ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0)",
    zIndex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },
  slide: {
    width: "100%",
    position: "relative",
    minHeight: "100%",
    background: "white",
    left: ({ enter, left }: SlideProps) =>
      enter ? 0 : left ? "-100%" : "100%",
    transition: "left 0.4s ease-in-out",
  },
});

export const Slide: FunctionComponent<SlideProps> = ({
  enter,
  left,
  children,
}) => {
  const classes = useStyles({ enter, left });

  return (
    <div className={classes.root}>
      <div className={classes.slide}>{children}</div>
    </div>
  );
};
