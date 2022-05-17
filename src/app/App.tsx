import React, { useContext, useState } from "react";
import DataProvider, { DataContext } from "./storage/DataProvider";
import { createUseStyles } from "react-jss";
import { Slide } from "./components/Slide";
import { Leaderboard } from "./friends/Leaderboard";
import { NavBar } from "./components/NavBar";
import { GameInfoProvider } from "./storage/GameInfoProvider";
import { Hints } from "./hints/Hints";

export type Tab = "Hints" | "Leaderboard" | "Home";

const useStyles = createUseStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    gap: 16,
  },
  content: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
});

const App = () => {
  return (
    <GameInfoProvider>
      <DataProvider>
        <Content />
      </DataProvider>
    </GameInfoProvider>
  );
};

const Content = () => {
  const classes = useStyles();

  const {
    user,
    mutations: { logout },
  } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<Tab>("Home");

  return (
    <div className={classes.root}>
      <NavBar
        user={user}
        tab={activeTab}
        setTab={setActiveTab}
        logout={logout}
      />
      <div className={classes.content}>
        <Slide enter={activeTab === "Hints"}>
          <Hints />
        </Slide>
        <Slide enter={activeTab === "Leaderboard"}>
          <Leaderboard />
        </Slide>
      </div>
    </div>
  );
};

export default App;
