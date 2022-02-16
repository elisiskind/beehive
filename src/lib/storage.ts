import StorageChange = chrome.storage.StorageChange;
import { GameInfo, Guesses, User } from "./interfaces";

type StorageKey = "user" | "game-info" | "guesses";

type StorageType<K extends StorageKey> =
  K extends "user" ? User :
  K extends "game-info" ? GameInfo :
  K extends "guesses" ? Guesses :
    never;

export class ChromeStorage {
  static async set<K extends StorageKey>(
    key: K,
    value: null | StorageType<K>
  ): Promise<void> {
    await chrome.storage.sync.set({ key: value });
  }

  static async get<K extends StorageKey>(
    key: K
  ): Promise<StorageType<K> | null> {
    const value = await chrome.storage.sync.get(key);
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
