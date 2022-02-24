import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface ButtonProps {
  onClick: () => void;
  size?: "small" | "large" | "medium";
  className?: string;
  disabled?: boolean;
}

interface StyleProps {
  size: "small" | "large" | "medium";
  disabled: boolean;
}

const useStyles = createUseStyles({
  root: {
    background: ({ disabled }: StyleProps) =>
      disabled ? "#EEEEEE" : "#f7da21",
    outline: "none",
    border: "none",
    cursor: ({ disabled }: StyleProps) =>
      disabled ? "default" : "pointer",
    padding: ({ size }: StyleProps) =>
      size === "large"
        ? "16px 24px"
        : size === "medium"
        ? "8px 16px"
        : "4px 12px",
    borderRadius: 8,
    fontSize: ({ size }: StyleProps) =>
      size === "large" ? 24 : size === "medium" ? 18 : 12,

    "&:hover": {
      background: ({ disabled }: StyleProps) =>
        disabled ? "#EEEEEE" : "#e7ca11",
    },
    "&:active": {
      background: ({ disabled }: StyleProps) =>
        disabled ? "#EEEEEE" : "#d7ba01",
    },
  },
});

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  className,
  disabled,
  size,
}) => {
  const classes = useStyles({
    size: size ?? "small",
    disabled: disabled ?? false,
  });
  return (
    <button
      className={`${classes.root} ${className ? className : ""}`}
      disabled={disabled ?? false}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
};
