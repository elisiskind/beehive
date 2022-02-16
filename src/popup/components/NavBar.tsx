import React from "react";
import { createUseStyles } from "react-jss";
import { auth } from "..";
import { User } from "../storage/DataProvider";
import { Button } from "./Button";

const useStyles = createUseStyles({
  infoBar: {
    height: 28,
    padding: 16,
    borderBottom: "1px solid #bfbfbf",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userDetails: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exitButton: {
    background: "#cc7777",
    outline: "none",
    border: "none",
    cursor: "pointer",
    borderRadius: 4,

    "&:hover": {
      background: "#b76262",
    },
    "&:active": {
      background: "#994444",
    },
  },
  profileImage: {
    borderRadius: "50%",
    width: 24,
    height: 24,
  },
});

interface NabBarProps {
  title: string;
  back?: () => void;
  user: User;
}

export const NavBar = ({ title, back, user }: NabBarProps) => {
  const classes = useStyles();

  return (
    <div className={classes.infoBar}>
      {back ? (
        <>
          <div>{title}</div>
          <div>
            <Button onClick={back}>←</Button>
          </div>
        </>
      ) : (
        <>
          <div className={classes.userDetails}>
            {user.photo ? (
              <img
                className={classes.profileImage}
                src={user.photo}
                alt={"profile"}
              />
            ) : (
              <></>
            )}
            <span>{user.name ?? user.email}</span>
          </div>
          <Button onClick={() => auth.signOut()}>Sign out</Button>
        </>
      )}
    </div>
  );
};
