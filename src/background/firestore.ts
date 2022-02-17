import {
  collection,
  doc,
  Firestore as FirestoreInternal,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { User } from "../lib/interfaces";

export class Firestore {
  readonly _firestore: FirestoreInternal;

  constructor(firebase: FirestoreInternal) {
    this._firestore = firebase;
  }

  private _users = () => {
    return collection(this._firestore, "users");
  };

  saveUser = async (user: User) => {
    if (user.id) {
      await setDoc(doc(this._users(), user.id), user);
    } else {
      throw new Error("User must have id. User: " + user);
    }
  };

  updateGuesses = async (userId: string, guesses: string[]) => {
    await updateDoc(doc(this._users(), userId), {guesses})
  }

  retrieveUser = async (userId: string): Promise<User | null> => {
    return ((await getDoc(doc(this._users(), userId))).data() ??
      null) as User | null;
  };
}