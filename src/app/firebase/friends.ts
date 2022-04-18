import { FriendCode, User } from "../../lib/interfaces";
import { Logging } from "../../lib/logging";

export const generateFriendCode = (userId: string): FriendCode => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let generated = "";
  for (let i = 0; i < 6; i++) {
    generated += chars[Math.floor(Math.random() * chars.length)];
  }
  return {
    expiration: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime(),
    userId: userId,
    code: generated,
  };
};

export class Friends {
  private _friends: {
    [id: string]: {
      unsubscribe?: () => void;
      data?: User;
    };
  } = {};

  friendList = (): User[] => {
    return Object.values(this._friends)
      .map(({ data }) => data)
      .filter((friend) => !!friend) as User[];
  };

  handleUpdates = (
    updatedFriendIds: string[],
    subscribeToFriend: (
      id: string,
      onUpdate: (friend: User) => void
    ) => () => void,
    setFriendList: (friends: User[]) => void
  ): void => {
    // Remove friends that aren't in the new list
    Object.keys(this._friends)
      .filter((id) => !updatedFriendIds.includes(id))
      .forEach((id) => {
        Logging.info("Snapshot doesn't include " + id);
        this._remove(id);
      });

    // Add the friends if there are new ones, subscribe to them, and save unsubscribe functions
    updatedFriendIds
      .filter((id) => !Object.keys(this._friends).includes(id))
      .forEach((id) => {
        this._friends[id] = {};
        this._friends[id].unsubscribe = subscribeToFriend(id, (update) => {
          this._friends[id].data = update;
          setFriendList(this.friendList());
        });
      });
    setFriendList(this.friendList());
  };

  private _remove = (id: string) => {
    this._friends[id].unsubscribe?.();
    delete this._friends[id];
  };

  removeAll = () => {
    Object.keys(this._friends).forEach((id) => {
      this._remove(id);
    });
  };
}
