import { LeaderboardIcon } from "./icons/LeaderboardIcon";
import { BackIcon } from "./icons/BackIcon";
import { HintsIcon } from "./icons/HintsIcon";
import { Button } from "./Button";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    width: 32,
    display: "flex",
    justifyContent: "center",
  },
});

const icons = {
  leaderboard: <LeaderboardIcon />,
  hints: <HintsIcon />,
  back: <BackIcon />,
};

interface IconButtonProps {
  icon: keyof typeof icons;
  onClick: () => void;
  badge?: string;
}

export const IconButton = ({ icon, badge, onClick }: IconButtonProps) => {
  const classes = useStyles();

  const svg = icons[icon];

  return (
    <Button onClick={onClick} badge={badge} buttonType={"square"}>
      <div className={classes.root}>{svg}</div>
    </Button>
  );
};
