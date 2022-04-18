import { Logging } from "./logging";

export type MessageType = "auth-request" | "auth-response";

export interface Message {
  readonly type: MessageType;
}

export class AuthRequest implements Message {
  readonly type: MessageType = "auth-request";
  constructor(readonly silent?: boolean) {
  }
}

export class AuthResponse implements Message {
  readonly type: MessageType = "auth-response";

  constructor(readonly token?: string) {}
}

const tabFilter = (tab: any, url: string) => tab.url?.includes(url) && tab.id;

export class Messages {
  static send = (message: Message): void => {
    Logging.debug(
      "[messaging] Sending " + message.type + " message: ",
      message
    );
    chrome.runtime.sendMessage(message);
  };

  static sendToPage = (message: Message, url: string) => {
    return new Promise<void>((resolve) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const filteredTabs = tabs.filter((tab) => tabFilter(tab, url));
        filteredTabs.forEach((tab) => {
          if (tab.id) {
            Logging.debug(
              `[messaging] Sending ${message.type} message to ${tab.id}`,
              message
            );
            chrome.tabs.sendMessage(tab.id, message, resolve);
          }
        });
      });
    });
  };

  static listen = (onMessage: (message: Message) => Promise<void>) => {
    Logging.debug("Listening...");
    const callback = (message: Message): Promise<void> => {
      Logging.debug(
        "[messaging] Received " + message.type + " message: ",
        message
      );
      return onMessage(message);
    };
    chrome.runtime.onMessage.addListener(callback);
    return () => chrome.runtime.onMessage.removeListener(callback);
  };

  static isAuthRequest = (message: Message): message is AuthRequest => {
    return message.type === "auth-request";
  };

  static isAuthResponse = (message: Message): message is AuthResponse => {
    return message.type === "auth-response";
  };
}
