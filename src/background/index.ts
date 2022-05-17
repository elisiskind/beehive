import { ExecutionContext, executionContext } from "../lib/utils";
import { AuthFailure, AuthResponse, Messages } from "../lib/messaging";

const getToken = (interactive: boolean): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive }, (token) => {
        if (!token) {
          if (!chrome.runtime.lastError?.message?.includes('The user did not approve access')) {
            refreshToken(interactive).then(resolve).catch(reject);
          } else {
            reject(chrome.runtime.lastError?.message)
          }
        } else {
          resolve(token);
        }
      });
  });
};

const refreshToken = (interactive: boolean) => {
  return new Promise<string>((resolve, reject) => {
    chrome.identity.clearAllCachedAuthTokens(() => {
      if (interactive) {
        chrome.identity.getAuthToken({ interactive }, (token) => {
          if (!token) {
            reject("Auth failed, token is null.");
          } else {
            resolve(token);
          }
        });
      } else {
        reject('No token')
      }
    });
  })
}

if (executionContext() === ExecutionContext.BACKGROUND) {
  console.log('listening for messages')
  Messages.listen(async (message) => {
    if (Messages.isAuthRequest(message)) {
      try {
        const token = await getToken(message.interactive);
        return new AuthResponse(token);
      } catch (e) {
        return new AuthFailure(e);
      }
    } else if (Messages.isAuthRefreshRequest(message)) {
      try {
        const token = await refreshToken(message.interactive);
        return new AuthResponse(token);
      } catch (e) {
        return new AuthFailure(e);
      }
    }
  })
}

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
