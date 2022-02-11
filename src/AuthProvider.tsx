import React, { FunctionComponent, useEffect, useState } from "react";
import { User as FirebaseUser } from "@firebase/auth";
import { Spinner } from "./components/spinner";
import { Login } from "./Login";
import { createUseStyles } from "react-jss";
import DataProvider from "./storage/DataProvider";
import {
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider
} from "firebase/auth";

export interface User {
  name: string | null;
  photo: string | null;
  id: string | null;
}

const useStyles = createUseStyles({
  root: {
    height: 360,
    width: 360,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  rootLoading: {
    height: 360,
    width: 360,
    background: "#f7da21",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  nav: {
    width: "360px",
    height: "calc(300px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
});

export const AuthProvider: FunctionComponent = ({ children }) => {
  const classes = useStyles();

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    setAuthLoading(true);
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      const credential = GoogleAuthProvider.credential(null, token);
      signInWithCredential(getAuth(), credential).then();
    });
  };

  useEffect(() => {
    onAuthStateChanged(getAuth(), (user) => {
      setUser(extractUser(user));
      setAuthLoading(false);
    });
  }, []);

  const extractUser = (firebaseUser: FirebaseUser | null): User | null => {
    if (firebaseUser) {
      return {
        name: firebaseUser.displayName,
        photo: firebaseUser.photoURL,
        id: firebaseUser.uid,
      };
    } else {
      return null;
    }
  };

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
        <Login login={login} />
      </div>
    );
  }

  return <DataProvider user={user}>{children}</DataProvider>;
};
