import { FunctionComponent } from "react";
import { createUseStyles } from "react-jss";

interface ButtonProps {
  onClick: () => void;
  size?: "small" | "large" | "medium";
  className?: string;
  disabled?: boolean;
  buttonType?: "round" | "square";
}

interface StyleProps {
  size: "small" | "large" | "medium";
  disabled: boolean;
}

const useStyles = createUseStyles({
  rootRound: {
    outline: "none",
    cursor: ({ disabled }: StyleProps) => (disabled ? "default" : "pointer"),
    padding: 15,
    minWidth: "5.5em",
    height: "3em",
    backgroundColor: "white",
    fontSize: "1em",
    margin: "0 8px",
    color: ({ disabled }: StyleProps) => (disabled ? "#666" : "#333"),
    border: ({ disabled }: StyleProps) =>
      `1px solid ${disabled ? "#ececec" : "#dcdcdc"}`,
    borderRadius: "2.5em",
    letterSpacing: "0.01em",
    userSelect: "none",
    "&:active": {
      background: ({ disabled }: StyleProps) =>
        disabled ? "white" : "#ededed",
    },
  },
  rootSquare: {
    fontFamily: "'nyt-franklin'",
    fontSize: "1.125em",
    lineHeight: "45px",
    height: '56px',
    padding: "6px 13px 4px",
    color: "#000",
    backgroundColor: "white",
    border: "none",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    "&:hover": { cursor: "pointer", backgroundColor: "#f4f4f4", color: "#000" },
  },
});

export const Button: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  className,
  disabled = false,
  size = "small",
  buttonType = "round",
}) => {
  const classes = useStyles({
    size,
    disabled,
  });
  return (
    <button
      className={`${
        buttonType === "round" ? classes.rootRound : classes.rootSquare
      } ${className ? className : ""}`}
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
