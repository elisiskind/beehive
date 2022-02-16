import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface ButtonProps {
  onClick: () => void;
  size?: 'small' | 'large'
}

interface StyleProps {
  size: 'small' | 'large'
}

const useStyles = createUseStyles({
  root: {
    background: "#f7da21",
    outline: "none",
    border: "none",
    cursor: "pointer",
    padding: ({size}: StyleProps) => size === 'large' ? '16px 24px' : '4px 12px',
    borderRadius: 8,
    fontSize: ({size}: StyleProps) => size === 'large' ? 24 : 12,

    "&:hover": {
      background: "#e7ca11",
    },
    "&:active": {
      background: "#d7ba01",
    },
  }
});

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  size
}) => {
  const classes = useStyles({size: size ?? 'small'});
  return <button className={classes.root} onClick={onClick}>
    {children}
  </button>;
};
