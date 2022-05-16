import { Logging } from "./logging";

export type MessageType =
  | "auth-request"
  | "auth-response"
  | "auth-failure"
  | "auth-refresh-request";

export interface Message {
  readonly type: MessageType;
}

export class AuthRequest implements Message {
  readonly type: MessageType = "auth-request";

  constructor(readonly interactive: boolean) {}
}

export class AuthRefreshRequest implements Message {
  readonly type: MessageType = "auth-refresh-request";

  constructor(readonly interactive: boolean) {}
}

export class AuthResponse implements Message {
  readonly type: MessageType = "auth-response";

  constructor(readonly token: string) {}
}

export class AuthFailure implements Message {
  readonly type: MessageType = "auth-failure";

  constructor(readonly error: any) {}
}

export class Messages {
  static send = (message: Message): Promise<Message> => {
    Logging.debug(
      "[messaging] Sending " + message.type + " message: ",
      message
    );
    return new Promise<Message>((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  };

  static listen = (
    onMessage: (message: Message) => Promise<void | Message>
  ) => {
    Logging.debug("Listening...");
    const callback = (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (message: Message) => void
    ) => {
      Logging.debug(
        "[messaging] Received " + message.type + " message: ",
        message
      );
      onMessage(message).then((message) => {
        if (message) {
          Logging.debug(
            "[messaging] Responding with " + message.type + " message: ",
            message
          );
          sendResponse(message);
        }
      });
      return true;
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  };

  static isAuthRequest = (message: Message): message is AuthRequest => {
    return message.type === "auth-request";
  };

  static isAuthRefreshRequest = (message: Message): message is AuthRefreshRequest => {
    return message.type === "auth-refresh-request";
  };

  static isAuthResponse = (message: Message): message is AuthResponse => {
    return message.type === "auth-response";
  };

  static isAuthFailure = (message: Message): message is AuthFailure => {
    return message.type === "auth-failure";
  };
}
