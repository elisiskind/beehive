import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  Firestore as FirestoreInternal,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { FriendCode, Guesses, User } from "../lib/interfaces";
import { Logging } from "../lib/logging";

export class Firestore {
  readonly _firestore: FirestoreInternal;

  constructor(firebase: FirestoreInternal) {
    this._firestore = firebase;
  }

  private _users = () => {
    return collection(this._firestore, "users");
  };

  private _friendCodes = () => {
    return collection(this._firestore, "friend-codes");
  };

  private _friendRequests = () => {
    return collection(this._firestore, "friend-requests");
  };

  saveUser = async (user: User) => {
    if (user.id) {
      await setDoc(doc(this._users(), user.id), user);
    } else {
      throw new Error("User must have id. User: " + user);
    }
  };

  updateUserName = async (userId: string, name: string) => {
    await setDoc(doc(this._users(), userId), { name }, { merge: true });
  };

  updateGuesses = async (userId: string, guesses: Guesses) => {
    await setDoc(
      doc(this._users(), userId),
      {
        guesses: {
          [guesses.id]: guesses.words,
        },
      },
      { merge: true }
    );
  };

  retrieveUser = async (userId: string): Promise<User | null> => {
    return ((await getDoc(doc(this._users(), userId))).data() ??
      null) as User | null;
  };

  addFriendCode = async (code: FriendCode) => {
    Logging.info("setting friend code");
    await setDoc(doc(this._friendCodes(), code.code), {
      userId: code.userId,
      expiration: code.expiration,
    });
  };

  findFriend = async (code: string) => {
    Logging.info("Finding code", code);
    const friendCode = (await getDoc(doc(this._friendCodes(), code))).data() as
      | FriendCode
      | undefined;
    if (friendCode) {
      return await this.retrieveUser(friendCode.userId);
    } else {
      return null;
    }
  };

  addFriend = async (user: User, friend: User) => {
    await this.acceptFriendRequest(friend.id, user.id);
    await setDoc(
      doc(this._friendRequests(), friend.id),
      {
        friends: arrayUnion(user.id),
      },
      { merge: true }
    );
  };

  listenForFriendshipUpdates(
    userId: string,
    onFriendUpdate: (friend: User) => void,
    onFriendRequestsUpdate: (friends: User[]) => void
  ) {
    const unsubscribeFriendsWords: (() => void)[] = [];

    const unsubscribeFriends = onSnapshot(
      doc(this._users(), userId),
      async (snapshot) => {
        console.log("List update!");
        while (unsubscribeFriendsWords.length > 0) {
          unsubscribeFriendsWords.pop()?.();
        }
        const friendIds: string[] = snapshot.data()?.friends ?? [];
        const friends = await this.retrieveFriends(friendIds);
        for (let friend of friends) {
          const unsubscribe = onSnapshot(
            doc(this._users(), friend.id),
            (friendSnapshot) => {
              Logging.info("update!");
              const updatedFriend = friendSnapshot.data();
              if (updatedFriend) onFriendUpdate(updatedFriend as User);
            }
          );
          unsubscribeFriendsWords.push(() => {
            Logging.info("unsubscribe!");
            unsubscribe();
          });
        }
      }
    );
    const unsubscribeFriendRequests = onSnapshot(
      doc(this._friendRequests(), userId),
      async (snapshot) => {
        const friendIds: string[] = snapshot.data()?.friends ?? [];
        const friends = await this.retrieveFriends(friendIds);
        onFriendRequestsUpdate(friends);
      }
    );

    return () => {
      unsubscribeFriends();
      unsubscribeFriendRequests();
      unsubscribeFriendsWords.forEach((unsubscribe) => unsubscribe());
    };
  }

  acceptFriendRequest = async (friendId: string, userId: string) => {
    await setDoc(
      doc(this._friendRequests(), userId),
      {
        friends: arrayRemove(friendId),
      },
      { merge: true }
    );
    await setDoc(
      doc(this._users(), userId),
      {
        friends: arrayUnion(friendId),
      },
      { merge: true }
    );
  };

  retrieveFriends = async (friendIds: string[]) => {
    const friends = await Promise.all(friendIds.map(this.retrieveUser));
    return friends.filter((friend) => !!friend) as User[];
  };
}