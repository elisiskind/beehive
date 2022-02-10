import React, { useContext, useEffect, useState } from "react";
import "./App.css";
import { Grid } from "./Grid";
import { Login } from "./Login";
import { DataContext } from "./DataProvider";
import { createUseStyles } from "react-jss";
import { firebaseAuth } from ".";
import { Spinner } from "./components/spinner";

type Tab = "Hints" | "Friends" | "none";

const useStyles = createUseStyles({
  root: {
    height: 360,
    width: 360,
    display: "flex",
    flexDirection: "column",
  },
  rootLoading: {
    height: 360,
    width: 360,
    background: '#f7da21',
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },
  nav: {
    display: "flex",
    flexDirection: "column",
  },
  navButton: {
    textDecoration: "none",
    outline: "none",
    background: "none",
    color: "blue",
    "&:hover": {
      textDecoration: "underline",
    },
    cursor: "pointer",
    border: "none",
  },
  userDetails: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoBar: {
    padding: 16,
    background: "#f7da21",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

const App = () => {
  const { user, authLoading } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<Tab>("none");

  const classes = useStyles();

  useEffect(() => {
    console.log("User: ", user);
  }, [user]);

  if (authLoading) {
    return (
      <div className={classes.rootLoading}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={classes.root}>
        <Login />
      </div>
    );
  }

  const content = () => {
    switch (activeTab) {
      case "Hints":
        return <Grid />;
      case "Friends":
        return <div>FRIENDS GO HERE</div>;
      case "none":
        return (
          <div className={classes.nav}>
            <button
              onClick={() => setActiveTab("Hints")}
              className={classes.navButton}
            >
              Hints
            </button>
            <button
              onClick={() => setActiveTab("Friends")}
              className={classes.navButton}
            >
              Friends
            </button>
          </div>
        );
    }
  };

  const navBar =
    activeTab === "none" ? (
      <div className={classes.infoBar}>
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
          <span>{user.name}</span>
        </div>
        <button
          className={classes.navButton}
          onClick={() => firebaseAuth.signOut()}
        >
          Sign out
        </button>
      </div>
    ) : (
      <div className={classes.infoBar}>
        <div>{activeTab}</div>
        <div>
          <button
            className={classes.exitButton}
            onClick={() => setActiveTab("none")}
          >
            X
          </button>
        </div>
      </div>
    );

  return (
    <div className={classes.root}>
      {navBar}
      {content()}
    </div>
  );
};

export default App;
