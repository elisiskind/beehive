import { User as FirebaseUser } from "@firebase/auth";
import { User } from "../storage/DataProvider";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "..";
import { retrieveUser, saveUser } from "../storage/firestore";

export const extractUser = (firebaseUser: FirebaseUser): User => {
  return {
    name: firebaseUser.displayName,
    photo: firebaseUser.photoURL,
    id: firebaseUser.uid,
    email: firebaseUser.email,
    friends: [],
    guesses: [],
  };
};

export const listenForAuthUpdates = (setUser: (user: User | null) => void) => {
  onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('Auth changed', firebaseUser)
    if (firebaseUser?.uid) {
      let user = await retrieveUser(firebaseUser?.uid);
      if (!user) {
        user = extractUser(firebaseUser);
        await saveUser(user);
      }
      setUser(user);
    } else {
      setUser(null);
    }
  });
};

export const loginWithFirebase = () => {
  return new Promise<void>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      const credential = GoogleAuthProvider.credential(null, token);
      signInWithCredential(auth, credential)
      .then(() => resolve())
      .catch(() => {
        chrome.identity.clearAllCachedAuthTokens(() => {
          chrome.identity.getAuthToken({ interactive: true }, (token) => {
            const credential = GoogleAuthProvider.credential(null, token);
            signInWithCredential(auth, credential)
            .then(() => resolve())
            .catch(e => {
              reject('Failed to sign in: ' + e)
            });
          });
        });
      });
    });
  });
};
