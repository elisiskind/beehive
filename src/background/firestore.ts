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
import { Friends } from "./friends";
import {
  DocumentReference,
  DocumentSnapshot,
  FirestoreError,
  SetOptions,
  Unsubscribe,
  WithFieldValue,
} from "@firebase/firestore";

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

  private _onSnapshot<T>(
    reference: DocumentReference<T>,
    onNext: (snapshot: DocumentSnapshot<T>) => void,
    onError?: (error: FirestoreError) => void,
    onCompletion?: () => void
  ): Unsubscribe {
    Logging.debug("Subscribing to snapshot:" + reference.path);
    return onSnapshot(reference, onNext, onError);
  }

  private _setDoc<T>(
    reference: DocumentReference<T>,
    data: WithFieldValue<T>,
    options?: SetOptions
  ): Promise<void> {
    Logging.debug("Setting doc:" + reference.path + ": ", data);
    return options ? setDoc(reference, data, options) : setDoc(reference, data);
  }

  saveUser = async (user: User) => {
    if (user.id) {
      await this._setDoc(doc(this._users(), user.id), user);
    } else {
      throw new Error("User must have id. User: " + user);
    }
  };

  updateUserName = async (userId: string, name: string) => {
    await this._setDoc(doc(this._users(), userId), { name }, { merge: true });
  };

  updateGuesses = async (userId: string, guesses: Guesses) => {
    await this._setDoc(
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
    await this._setDoc(doc(this._friendCodes(), code.code), {
      userId: code.userId,
      expiration: code.expiration,
    });
  };

  findFriend = async (code: string) => {
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
    if (!friend.friends.includes(user.id)) {
      await setDoc(
        doc(this._friendRequests(), friend.id),
        {
          friends: arrayUnion(user.id),
        },
        { merge: true }
      );
    }
  };

  private _subscribeToFriend = (
    id: string,
    callback: (friend: User) => void
  ) => {
    return this._onSnapshot(doc(this._users(), id), (friendSnapshot) => {
      callback(friendSnapshot.data() as User);
    });
  };

  listenForFriendshipUpdates(
    userId: string,
    setUpdatedFriendList: (friends: User[]) => void,
    onFriendRequestsUpdate: (friends: User[]) => void
  ): Unsubscribe {
    const friends = new Friends();

    const unsubscribeFriends = this._onSnapshot(
      doc(this._users(), userId),
      async (snapshot) => {
        const updatedFriendIds: string[] = snapshot.data()?.friends ?? [];
        friends.handleUpdates(
          updatedFriendIds,
          this._subscribeToFriend,
          setUpdatedFriendList
        );
      }
    );

    const unsubscribeFriendRequests = this._onSnapshot(
      doc(this._friendRequests(), userId),
      async (snapshot) => {
        const friendIds: string[] = snapshot.data()?.friends ?? [];
        const friends = await this.retrieveFriends(friendIds);
        onFriendRequestsUpdate(friends);
      }
    );

    return () => {
      Logging.info("Unsubscribing from all");
      unsubscribeFriends();
      unsubscribeFriendRequests();
      friends.removeAll();
    };
  }

  acceptFriendRequest = async (friendId: string, userId: string) => {
    await this._setDoc(
      doc(this._friendRequests(), userId),
      {
        friends: arrayRemove(friendId),
      },
      { merge: true }
    );
    await this._setDoc(
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

  removeFriend = async (userId: string, friendId: string) => {
    await this._setDoc(
      doc(this._users(), userId),
      {
        friends: arrayRemove(friendId),
      },
      { merge: true }
    );
  };
}