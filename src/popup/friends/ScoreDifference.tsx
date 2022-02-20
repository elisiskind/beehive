import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  negative: {
    color: '#cc5040'
  },
  positive: {
    color: '#55aa66'
  },
  tied: {
    color: '#484848'
  }
})

interface ScoreDifferenceProps {
  myScore: number;
  theirScore: number;
}

export const ScoreDifference = ({myScore, theirScore}: ScoreDifferenceProps) => {
  const classes = useStyles();
  const diff = theirScore - myScore;

  if (diff === 0) {
    return <span className={classes.tied}>
      (Tied!)
    </span>
  } else {
    return <span className={classes[diff < 0 ? 'negative' : 'positive']}>
      ({diff > 0 ? `+${diff}` : diff} points)
    </span>
  }
}