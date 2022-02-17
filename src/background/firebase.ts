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
import { Logging } from "../lib/logging";
import { ChromeStorage } from "../lib/storage";

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
      Logging.info('Logging in!')
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

  logout = async () => {
    Logging.info('Signed out!')
    await this.auth().signOut();
  }

  listenForAuthUpdates = (setUser: (user: User | null) => void) => {
    onAuthStateChanged(this.auth(), async (firebaseUser) => {
      Logging.info("Auth changed", firebaseUser);
      if (firebaseUser?.uid) {
        let user = await this._firestore.retrieveUser(firebaseUser?.uid);
        if (!user) {
          user = await extractUser(firebaseUser);
          await this._firestore.saveUser(user);
        }
        setUser(user);
      } else {
        setUser(null);
      }
    });
  };
}

const extractUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  return {
    name: firebaseUser.displayName,
    photo: firebaseUser.photoURL,
    id: firebaseUser.uid,
    email: firebaseUser.email,
    friends: [],
    guesses: await ChromeStorage.get('guesses') ?? [],
  };
};