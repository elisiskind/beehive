import StorageChange = chrome.storage.StorageChange;
import { FriendCode, GameInfo, Guesses, User } from "./interfaces";
import { Logging } from "./logging";

type StorageKey =
  | "user"
  | "game-info"
  | "guesses"
  | "friend-code"
  | "friends"
  | "friend-requests"
  | "login-failed-message";

type StorageType<K extends StorageKey> = K extends "user"
  ? User
  : K extends "game-info"
  ? GameInfo
  : K extends "guesses"
  ? Guesses
  : K extends "friend-code"
  ? FriendCode
  : K extends "friend-requests"
  ? User[]
  : K extends "friends"
  ? User[]
  : K extends "login-failed-message"
  ? string
  : never;


export class ChromeStorage {
  private static async _setInternal<K extends StorageKey>(
    key: K,
    value: null | StorageType<K>
  ): Promise<void> {
    Logging.debug('[storage] Stored ' + key + ': ', value)
    const payload = { [key]: value };
    await chrome.storage.sync.set(payload);
  }

  private static setFunctions: Partial<Record<StorageKey, NodeJS.Timeout>> = {};

  static async set<K extends StorageKey>(
    key: K,
    value: null | StorageType<K>
  ): Promise<void> {
    const oldTimeout = this.setFunctions[key];
    if (oldTimeout) {
      clearTimeout(oldTimeout);
    }
    this.setFunctions[key] = setTimeout(() => this._setInternal(key, value), 100);
  }

  static async get<K extends StorageKey>(
    key: K
  ): Promise<StorageType<K> | null> {
    const value = await chrome.storage.sync.get(key);
    Logging.debug('[storage] Retrieved ' + key + ': ', value)
    if (value[key]) {
      return value[key] as StorageType<K>;
    } else {
      return null;
    }
  }

  static listen<K extends StorageKey>(
    key: K,
    onChange: (value: StorageType<K> | null) => void
  ): () => void {
    if (chrome?.storage?.onChanged) {
      const listener = (changes: { [x: string]: StorageChange }) => {
        if (changes[key]) {
          Logging.debug('[storage] Update for key ' + key + ': ', changes[key].newValue)
          onChange(changes[key].newValue);
        }
      };
      chrome?.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    } else {
      return () => {};
    }
  }
}
