import { User } from "./DataProvider";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "..";

const users = () => {
  return collection(firestore, "users");
}

export const saveUser = async (user: User) => {
  if (user.id) {
    await setDoc(doc(users(), user.id), user);
  } else {
    throw new Error('User must have id. User: ' + user);
  }
}

export const saveGuesses = async (userId: string, guesses: string[]) => {
    await updateDoc(doc(users(), userId), {guesses});
}

export const retrieveUser = async (userId: string): Promise<User | null> => {
    return ((await getDoc(doc(users(), userId))).data() ?? null) as (User | null);
}