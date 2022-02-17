import { GameInfo, User } from "./interfaces";
import { Logging } from "./logging";

export type MessageType =
  | "game-info-request"
  | "game-info-response"
  | "guesses-response"
  | "login-request"
  | "login-success"
  | "login-failed"
  | "logout-request";

interface Message {
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

export class LoginSuccessMessage implements Message {
  readonly type: MessageType = "login-success";

  readonly user: User;

  constructor(user: User) {
    this.user = user;
  }
}

export class LoginFailedMessage implements Message {
  readonly type: MessageType = "login-failed";

  readonly error: any;

  constructor(error: any) {
    this.error = error;
  }
}

export class GuessesResponseMessage implements Message {
  readonly type: MessageType = "guesses-response";

  readonly guesses: string[];

  constructor(guesses: string[]) {
    this.guesses = guesses;
  }
}

export class LogoutRequestMessage implements Message {
  readonly type: MessageType = "logout-request";
}

export class Messages {
  static send = (message: Message, url?: string) => {
    if (url) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url?.includes(url) && tab.id) {
            chrome.tabs.sendMessage(tab.id, message);
          }
        });
      });
    }
    chrome.runtime.sendMessage(message);
  };

  static listen = (onMessage: (message: Message) => void) => {
    const wrapped = (message: Message, sender: chrome.runtime.MessageSender) => {
      Logging.info('Received message from sender', message, sender.id)
      onMessage(message);
    }
    chrome.runtime.onMessage.addListener(wrapped);
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

  static isLoginSuccess = (
    message: Message
  ): message is LoginSuccessMessage => {
    return message.type === "login-success";
  };

  static isLoginFailed = (message: Message): message is LoginFailedMessage => {
    return message.type === "login-failed";
  };

  static isLogoutRequest = (
    message: Message
  ): message is LogoutRequestMessage => {
    return message.type === "logout-request";
  };
}
