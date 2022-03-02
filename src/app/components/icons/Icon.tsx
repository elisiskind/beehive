import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  root: {
    height: ({ size }: IconProps) => size ?? 24,
    width: ({ size }: IconProps) => size ?? 24,
    display: 'flex'
  },
});

export interface IconProps {
  size?: number;
}

interface SvgBaseProps extends IconProps {
  paths: JSX.Element;
}

export const Icon = ({ paths, size }: SvgBaseProps) => {
  const classes = useStyles({ size });

  return (
    <div className={classes.root}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={`${size ?? 24}px`}
        viewBox="0 0 24 24"
        width={`${size ?? 24}px`}
        fill="#000000"
      >
        {paths}
      </svg>
    </div>
  );
};
