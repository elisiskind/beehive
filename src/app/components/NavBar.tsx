import React, { useContext, useState } from "react";
import { createUseStyles } from "react-jss";
import { User } from "../../lib/interfaces";
import { Button } from "./Button";
import { Tab } from "../App";
import { DataContext } from "../storage/DataProvider";
import { IconButton } from "./IconButton";

const useStyles = createUseStyles({
  infoBar: {
    padding: 0,
    borderBottom: "1px solid #dcdcdc",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  title: {
    lineHeight: "24px",
    paddingLeft: 16,
  },
  group: {
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
  backButton: {
    display: "flex",
  },
  usernameButton: {
    height: "100%",
  },
  logoutDropDown: {
    position: "absolute",
    top: "100%",
    zIndex: "99",
    textAlign: "right",
    border: "1px solid #c4c4c4",
    background: "#fff",
  },
  logoutButton: {
    width: 150,
  },
  dropdownItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    cursor: "pointer",
  },
  userName: {
    lineHeight: "24px",
  },
});

interface LoggedInNavBarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  user: User;
  logout: () => Promise<void>;
}

interface LoggedOutNavBarProps {
  login: () => void;
}

const isLoggedOutNavBarProps = (
  props: LoggedInNavBarProps | LoggedOutNavBarProps
): props is LoggedOutNavBarProps => {
  return "login" in props;
};

export const NavBar = (props: LoggedInNavBarProps | LoggedOutNavBarProps) => {
  const classes = useStyles();

  const [showLogout, setShowLogout] = useState<boolean>(false);
  const { friendRequests, friends } = useContext(DataContext);

  const content = () => {
    if (isLoggedOutNavBarProps(props)) {
      return (
        <>
          <div className={classes.title}>
            Sign in to share your score with friends
          </div>
          <div>
            <Button buttonType={"square"} onClick={props.login}>
              Sign In
            </Button>
          </div>
        </>
      );
    }

    const { tab, setTab, user } = props;

    switch (tab) {
      case "Hints":
      case "Leaderboard":
        return (
          <>
            <div className={classes.title}>{tab}</div>
            <div>
              <IconButton icon={"back"} onClick={() => setTab("Home")} />
            </div>
          </>
        );
      case "Home":
        return (
          <>
            <Button
              buttonType={"square"}
              onClick={() => setShowLogout(!showLogout)}
              className={classes.usernameButton}
            >
              <div className={classes.group}>
                <img
                  className={classes.profileImage}
                  src={user.photo}
                  alt={"profile"}
                />
                <span className={classes.userName}>
                  {user.name ?? user.email}
                </span>
                <span
                  className={`pz-dropdown__arrow ${
                    showLogout ? " reverse" : ""
                  }`}
                />
              </div>
            </Button>
            {showLogout ? (
              <div className={classes.logoutDropDown}>
                <div className={classes.dropdownItem}>
                  <Button
                    buttonType={"square"}
                    onClick={props.logout}
                    className={classes.logoutButton}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className={classes.group}>
              <IconButton icon={"hints"} onClick={() => setTab("Hints")} />
              <IconButton
                onClick={() => setTab("Leaderboard")}
                icon={"leaderboard"}
                badge={
                  /* Show number of friend requests if there are any, otherwise, if there are no friends show a "!" so
                  the user knows to click there to add friends */
                  friendRequests?.length > 0
                    ? friendRequests.length.toString()
                    : friends?.length > 0
                    ? undefined
                    : "!"
                }
              />
            </div>
          </>
        );
    }
  };

  return <div className={classes.infoBar}>{content()}</div>;
};
