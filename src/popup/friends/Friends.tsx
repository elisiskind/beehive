import React from "React";
import { useContext, useState } from "react";
import { DataContext } from "../storage/DataProvider";
import { Slide } from "../components/Slide";
import { Button } from "../components/Button";

export const Friends = () => {
  const [friend, setFriend] = useState<string | null>(null);
  const { user } = useContext(DataContext);
  const [view, setView] = useState<"list" | "add">();

  return (
    <>
      <Slide enter={view === "list"}>
        <Button
          onClick={() => {
            setView("add");
          }}
        >
          Add friends
        </Button>
        <div>You have a friend named: {friend}</div>
      </Slide>
      <Slide enter={view === "list"}>
        <Button
          onClick={() => {
            setView("add");
          }}
        >
          Add friends
        </Button>
        <div>You have a friend named: {friend}</div>
      </Slide>
    </>
  );
};
