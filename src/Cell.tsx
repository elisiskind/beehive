import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

export type GridData = { [key: string]: { [key: number]: number } };

const useStyles = createUseStyles({
  root: {
    padding: 4,
  },
  inner: {
    width: 16,
    fontFamily: "nyt-imperial,georgia,'times new roman',times,serif",
    fontWeight: ({ bold }: CellProps) => (bold ? "bold" : "normal"),
  },
});

interface CellProps {
  bold?: boolean;
}

export const Cell: FunctionComponent<CellProps> = ({ children, bold }) => {
  const classes = useStyles({ bold });

  return (
    <span className={classes.root}>
      <div className={classes.inner}>{children}</div>
    </span>
  );
};
