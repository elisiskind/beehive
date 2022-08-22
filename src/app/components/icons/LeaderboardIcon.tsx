import { Icon, IconProps } from "./Icon";

export const LeaderboardIcon = ({ size }: IconProps) => {
  const paths = (
    <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
  );

  return <Icon paths={paths} size={size} />;
};
