import { Logging } from "./logging";

export class Tabs {
  static onTab = (
    urls: string[],
    callback: (tabId: number) => void | Promise<void>,
    otherwise?: (tabId: number) => void | Promise<void>
  ) => {
    chrome.tabs.onActivated.addListener(async (info) => {
      const tab = await chrome.tabs.get(info.tabId);
      for (let url of urls) {
        if (tab.url?.indexOf(url) !== -1) {
          callback(info.tabId);
          return;
        }
      }
      otherwise?.(info.tabId);
    });
  };

  static enableExtension = async (tabId: number) => {
    Logging.debug('Enabling extension: ' + tabId)
    await chrome.action.enable(tabId);
  };

  static disableExtension = async (tabId: number) => {
    Logging.debug('Disabling extension: ' + tabId)
    await chrome.action.disable(tabId);
  };
}
