import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  User as FirebaseUser,
} from "firebase/auth";
import { FirebaseApp as FirebaseAppInternal, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { User } from "../lib/interfaces";
import { Firestore } from "./firestore";

export class FirebaseApp {
  readonly app: FirebaseAppInternal;
  private readonly _firestore: Firestore;

  constructor() {
    const firebaseConfig = {
      apiKey: "AIzaSyAiscxS1ivbtIs1zSwtawJnYfES2kuEvuc",
      authDomain: "sb-beehive.firebaseapp.com",
      projectId: "sb-beehive",
      storageBucket: "sb-beehive.appspot.com",
      messagingSenderId: "149062792666",
      appId: "1:149062792666:web:b7769886dcb9ac44a6bce3",
    };
    this.app = initializeApp(firebaseConfig);
    this._firestore = new Firestore(getFirestore());
  }

  auth() {
    return getAuth();
  }

  getFirestore = () => this._firestore;

  login = () => {
    return new Promise<void>((resolve, reject) => {
      console.log('Logging in!')
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        const credential = GoogleAuthProvider.credential(null, token);
        signInWithCredential(this.auth(), credential)
          .then(() => resolve())
          .catch(() => {
            chrome.identity.clearAllCachedAuthTokens(() => {
              chrome.identity.getAuthToken({ interactive: true }, (token) => {
                const credential = GoogleAuthProvider.credential(null, token);
                signInWithCredential(this.auth(), credential)
                  .then(() => resolve())
                  .catch((e) => {
                    reject("Failed to sign in: " + e);
                  });
              });
            });
          });
      });
    });
  };

  listenForAuthUpdates = (setUser: (user: User | null) => void) => {
    onAuthStateChanged(this.auth(), async (firebaseUser) => {
      console.log("Auth changed", firebaseUser);
      if (firebaseUser?.uid) {
        let user = await this._firestore.retrieveUser(firebaseUser?.uid);
        if (!user) {
          user = extractUser(firebaseUser);
          await this._firestore.saveUser(user);
        }
        setUser(user);
      } else {
        setUser(null);
      }
    });
  };
}

const extractUser = (firebaseUser: FirebaseUser): User => {
  return {
    name: firebaseUser.displayName,
    photo: firebaseUser.photoURL,
    id: firebaseUser.uid,
    email: firebaseUser.email,
    friends: [],
    guesses: {
      guesses: [],
      expiration: 0,
    },
  };
};