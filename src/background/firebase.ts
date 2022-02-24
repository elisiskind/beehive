import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser,
} from "firebase/auth";
import {
  FirebaseApp as FirebaseAppInternal,
  initializeApp,
} from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { User } from "../lib/interfaces";
import { Firestore } from "./firestore";

const createUser = (firebaseUser: FirebaseUser): User => {
  return {
    name: firebaseUser.displayName,
    photo:
      firebaseUser.photoURL ??
      "https://lh3.googleusercontent.com/pw/AM-JKLUfpoZSOE0mrMYpnEOaG_zlGQOwyPnheqPbUEBC7URlVTPd-0k7UKkxN0-ssDfR8omPLt2xrqx3qJgQQ5rzySrCtNPRxs1lWhU0L3bb9Znu2t9ycLWgt382zJ17vjR8m2hf4Rj5Wzdm9E-c-D8zP3316A=w990-h934-no?authuser=0",
    id: firebaseUser.uid,
    email: firebaseUser.email,
    friends: [],
    guesses: {},
  };
};

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

  getFirestore = () => this._firestore;

  login = () => {
    return new Promise<User>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        const credential = GoogleAuthProvider.credential(null, token);
        signInWithCredential(getAuth(), credential)
          .then((value) => resolve(this._onSignIn(value.user)))
          .catch(() => {
            chrome.identity.clearAllCachedAuthTokens(() => {
              chrome.identity.getAuthToken({ interactive: true }, (token) => {
                const credential = GoogleAuthProvider.credential(null, token);
                signInWithCredential(getAuth(), credential)
                  .then((value) => resolve(this._onSignIn(value.user)))
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
    await getAuth().signOut();
  };

  currentUser = (): User | null => {
    const currentUser = getAuth().currentUser;
    return currentUser ? createUser(currentUser) : null;
  };

  private _onSignIn = async (firebaseUser: FirebaseUser): Promise<User> => {
    let user = await this._firestore.retrieveUser(firebaseUser?.uid);
    if (!user) {
      user = createUser(firebaseUser);
      await this._firestore.saveUser(user);
    } else if (!user.name && firebaseUser.displayName) {
      await this._firestore.updateUserName(user.id, firebaseUser.displayName);
    }
    return user;
  };
}
