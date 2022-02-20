import { User } from "../../lib/interfaces";
import { createUseStyles } from "react-jss";
import { Button } from "../components/Button";
import { AcceptFriendRequestMessage, Messages } from "../../lib/messaging";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: '#efefef',
    borderRadius: 8,
    padding:'4px 8px'
  },
  profile: {
    height: 24,
    width: 24,
    borderRadius: "50%",
  },
  profileInfo: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 4
  },
});

interface FriendRequestProps {
  user: User;
}

export const FriendRequest = ({ user }: FriendRequestProps) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.profileInfo}>
        <img
          className={classes.profile}
          src={
            user.photo ??
            "https://lh3.googleusercontent.com/pw/AM-JKLUfpoZSOE0mrMYpnEOaG_zlGQOwyPnheqPbUEBC7URlVTPd-0k7UKkxN0-ssDfR8omPLt2xrqx3qJgQQ5rzySrCtNPRxs1lWhU0L3bb9Znu2t9ycLWgt382zJ17vjR8m2hf4Rj5Wzdm9E-c-D8zP3316A=w990-h934-no?authuser=0"
          }
          alt={"profile"}
        />
        <div>{user.name}</div>
      </div>
      <Button
        onClick={() => Messages.send(new AcceptFriendRequestMessage(user.id))}
      >
        Accept
      </Button>
    </div>
  );
};
