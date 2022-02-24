import React, { useContext, useState } from "react";
import DataProvider, { DataContext } from "./storage/DataProvider";
import { createUseStyles } from "react-jss";
import { Button } from "./components/Button";
import { Slide } from "./components/Slide";
import { Grid } from "./hints/Grid";
import { Leaderboard } from "./friends/Leaderboard";
import { NavBar } from "./components/NavBar";

type Tab = "Hints" | "Friends" | "none";

const useStyles = createUseStyles({
  root: {
    height: 360,
    width: 480,
    display: "flex",
    flexDirection: "column",
  },
  nav: {
    width: 480,
    height: "calc(300px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});

const App = () => {
  return (
    <DataProvider>
      <Content />
    </DataProvider>
  );
};

const Content = () => {
  const classes = useStyles();

  const { user } = useContext(DataContext);
  const [activeTab, setActiveTab] = useState<Tab>("none");

  return (
    <div className={classes.root}>
      <NavBar
        user={user}
        title={activeTab}
        back={activeTab === "none" ? undefined : () => setActiveTab("none")}
      />
      <Slide left={true} enter={activeTab === "none"}>
        <div className={classes.nav}>
          <Button size={"large"} onClick={() => setActiveTab("Hints")}>
            Hints
          </Button>
          <Button size={"large"} onClick={() => setActiveTab("Friends")}>
            Leaderboard
          </Button>
        </div>
      </Slide>
      <Slide enter={activeTab === "Hints"}>
        <Grid />
      </Slide>
      <Slide enter={activeTab === "Friends"}>
        <Leaderboard />
      </Slide>
    </div>
  );
};

export default App;
