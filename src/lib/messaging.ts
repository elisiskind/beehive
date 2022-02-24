import { GameInfo, Guesses } from "./interfaces";
import { Logging } from "./logging";

export type MessageType =
  | "game-info-request"
  | "game-info-response"
  | "guesses-response"
  | "login-request"
  | "logout-request"
  | "generate-friend-code-request"
  | "generate-friend-code-response"
  | "add-friend-request"
  | "add-friend-response"
  | "accept-friend-request"
  | "remove-friend-request"
  | "listen-to-friends-request";

export interface Message {
  readonly type: MessageType;
}

export class GameInfoRequestMessage implements Message {
  readonly type: MessageType = "game-info-request";
}

export class GameInfoResponseMessage implements Message {
  readonly type: MessageType = "game-info-response";
  readonly gameInfo: GameInfo;

  constructor(gameInfo: GameInfo) {
    this.gameInfo = gameInfo;
  }
}

export class LoginRequestMessage implements Message {
  readonly type: MessageType = "login-request";
}

export class GuessesResponseMessage implements Message {
  readonly type: MessageType = "guesses-response";
  readonly guesses: Guesses;

  constructor(guesses: Guesses) {
    this.guesses = guesses;
  }
}

export class LogoutRequestMessage implements Message {
  readonly type: MessageType = "logout-request";
}

export class GenerateFriendCodeRequestMessage implements Message {
  readonly type: MessageType = "generate-friend-code-request";
}

export class AddFriendRequestMessage implements Message {
  readonly type: MessageType = "add-friend-request";
  readonly code: string;

  constructor(code: string) {
    this.code = code;
  }
}

export class AddFriendResponseMessage implements Message {
  readonly type: MessageType = "add-friend-response";
  readonly name?: string;

  constructor(name?: string) {
    this.name = name;
  }
}

export class AcceptFriendRequestMessage implements Message {
  readonly type: MessageType = "accept-friend-request";
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class RemoveFriendRequestMessage implements Message {
  readonly type: MessageType = "remove-friend-request";
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export class ListenToFriendsRequestMessage implements Messages {
  readonly type: MessageType = "listen-to-friends-request";
}

export class Messages {
  static send = (message: Message, url?: string) => {
    if (url) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url?.includes(url) && tab.id) {
            Logging.debug("[messaging] Sending " + message.type + " message to " + tab.id + ": ", message);
            chrome.tabs.sendMessage(tab.id, message);
          }
        });
      });
    } else {
      Logging.debug("[messaging] Sending " + message.type + " message: ", message);
      chrome.runtime.sendMessage(message);
    }
  };

  static listen = (onMessage: (message: Message) => void) => {
    const callback = (
      message: Message
    ) => {
      Logging.debug("[messaging] Received " + message.type + " message: ", message);
      onMessage(message);
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  };

  static isGameInfoRequest = (
    message: Message
  ): message is GameInfoRequestMessage => {
    return message.type === "game-info-request";
  };

  static isGameInfoResponse = (
    message: Message
  ): message is GameInfoResponseMessage => {
    return message.type === "game-info-response";
  };

  static isGuessesResponse = (
    message: Message
  ): message is GuessesResponseMessage => {
    return message.type === "guesses-response";
  };

  static isLoginRequest = (
    message: Message
  ): message is LoginRequestMessage => {
    return message.type === "login-request";
  };

  static isLogoutRequest = (
    message: Message
  ): message is LogoutRequestMessage => {
    return message.type === "logout-request";
  };

  static isGenerateFriendCodeRequest = (
    message: Message
  ): message is GenerateFriendCodeRequestMessage => {
    return message.type === "generate-friend-code-request";
  };

  static isAddFriendRequest = (
    message: Message
  ): message is AddFriendRequestMessage => {
    return message.type === "add-friend-request";
  };

  static isAddFriendResponse = (
    message: Message
  ): message is AddFriendResponseMessage => {
    return message.type === "add-friend-response";
  };

  static isAcceptFriendRequest = (
    message: Message
  ): message is AcceptFriendRequestMessage => {
    return message.type === "accept-friend-request";
  };

  static isRemoveFriendRequest = (
    message: Message
  ): message is RemoveFriendRequestMessage => {
    return message.type === "remove-friend-request";
  };

  static isListenToFriendsRequest = (
    message: Message
  ): message is ListenToFriendsRequestMessage => {
    return message.type === "listen-to-friends-request";
  };
}
