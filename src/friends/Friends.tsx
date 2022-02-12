import React from "React";
import { useContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "..";
import { DataContext } from "../storage/DataProvider";

export const Friends = () => {
  const [friend, setFriend] = useState<string | null>(null);
  const { user } = useContext(DataContext);

  useEffect(() => {
    if (user) {
      return onSnapshot(doc(firestore, "users", user.id), (doc) => {
        setFriend(doc.data()?.name);
      });
    }
  }, [user]);

  return <div>You have a friend named: {friend}</div>;
};
