import { ExecutionContext, executionContext } from "../lib/utils";
import { AuthResponse, Messages } from "../lib/messaging";
import { Logging } from "../lib/logging";

const SPELLING_BEE_URL = "nytimes.com/puzzles/spelling-bee";

Messages.listen( (message) => {
  return new Promise((resolve) => {
    if (executionContext() !== ExecutionContext.BACKGROUND) {
      return resolve();
    }

    if (Messages.isAuthRequest(message)) {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (!token) {
          chrome.identity.clearAllCachedAuthTokens(() => {
            chrome.identity.getAuthToken({ interactive: !message.silent }, (token) => {
              if (!token) {
                Logging.error("Auth failed, token is null.");
              }
              Messages.sendToPage(new AuthResponse(token), SPELLING_BEE_URL).then(resolve);
            });
          });
        } else {
          Messages.sendToPage(new AuthResponse(token), SPELLING_BEE_URL).then(resolve);
        }
      });
    }
  });
});

chrome.runtime.onInstalled.addListener(async () => {
  if (executionContext() !== ExecutionContext.BACKGROUND) {
    return;
  }
  (chrome.runtime.getManifest().content_scripts ?? [])
    .filter(
      (cs): cs is { js: string[]; matches: string[] } => !!cs.js && !!cs.matches
    )
    .forEach((cs) => {
      chrome.tabs.query({ url: cs.matches }).then((tabs) => {
        tabs
          .map((tab) => tab.id)
          .filter((id): id is number => !!id)
          .forEach((id) => {
            chrome.scripting.executeScript({
              target: { tabId: id },
              files: cs.js,
            });
          });
      });
    });
});
