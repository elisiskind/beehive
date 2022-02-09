import { useContext } from "react";
import { createUseStyles } from "react-jss";
import { Cell } from "./Cell";
import { DataContext } from "./DataProvider";

const useStyles = createUseStyles({
  root: {
    margin: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  row: {
    display: "flex",
    width: "100%",
    gap: 4,
  },
});

export const Grid = () => {
  const classes = useStyles();
  const { grid } = useContext(DataContext);

  const possibleWordLengths = Array.from(
    new Set(Object.values(grid ?? {}).flatMap((map) => Object.keys(map)))
  ).sort();

  if (!grid) {
    return <div className={classes.row}>Loading...</div>;
  }

  const header = [
    ...possibleWordLengths.map((length) => {
      return <Cell key={length}>{length}</Cell>;
    }),
    <Cell bold>Σ</Cell>,
  ];

  const body = Object.keys(grid).map((letter) => {
    return (
      <div className={classes.row} key={letter}>
        <Cell bold>{letter}</Cell>
        {possibleWordLengths.map((length) => {
          return (
            <Cell key={length}>{grid[letter][parseInt(length)] ?? "-"}</Cell>
          );
        })}
        <Cell bold>
          {Object.values(grid[letter])
            .map((val) => (isNaN(val) ? 0 : val))
            .reduce((a, b) => a + b, 0)}
        </Cell>
      </div>
    );
  });

  const totals: { [key: string]: number } = {};
  Object.values(grid).forEach((entry) =>
    Object.entries(entry).forEach(([length, sum]) => {
      totals[length] = (totals[length] ?? 0) + sum;
    })
  );

  const totalTotal = Object.values(totals)
    .map((val) => (isNaN(val) ? 0 : val))
    .reduce((a, b) => a + b, 0);

  const totalRow = (
    <div className={classes.row}>
      <Cell>Σ</Cell>
      {Object.entries(totals)
        .sort()
        .map(([, value]) => (
          <Cell bold>{value}</Cell>
        ))}
      <Cell bold>{totalTotal}</Cell>
    </div>
  );

  return (
    <div className={classes.root}>
      <div className={classes.row}>
        <Cell />
        {header}
      </div>
      {body}
      {totalRow}
    </div>
  );
};
