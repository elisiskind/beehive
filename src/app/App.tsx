import React, { useContext, useState } from "react";
import DataProvider, { DataContext } from "./storage/DataProvider";
import { createUseStyles } from "react-jss";
import { Slide } from "./components/Slide";
import { Grid } from "./hints/Grid";
import { Leaderboard } from "./friends/Leaderboard";
import { NavBar } from "./components/NavBar";
import { Words } from "./words/Words";
import { GameInfoProvider } from "./storage/GameInfoProvider";

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

  const { user } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<Tab>("Home");

  return (
    <div className={classes.root}>
      <NavBar user={user} tab={activeTab} setTab={setActiveTab} />
      <div className={classes.content}>
        <Slide left={true} enter={activeTab === "Home"}>
          <Words />
        </Slide>
        <Slide enter={activeTab === "Hints"}>
          <Grid />
        </Slide>
        <Slide enter={activeTab === "Leaderboard"}>
          <Leaderboard />
        </Slide>
      </div>
    </div>
  );
};

export default App;
