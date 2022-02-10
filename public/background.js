chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onActivated.addListener(async (info) => {
    const tab = await chrome.tabs.get(info.tabId);
    const enabled =
      tab.url.indexOf("https://www.nytimes.com/puzzles/spelling-bee") !== -1;
    enabled
      ? chrome.action.enable(tab.tabId)
      : chrome.action.disable(tab.tabId);
    console.log('Enabled: ' + enabled)
  });
});

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.words) {
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ guesses: request.words });
  }
  if (request.answers) {
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ answers: request.answers });
  }
  if (request.type === 'login-success') {
    console.log('Setting new user value in storage: ', request.user)
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ user: request.user });
  }
  sendResponse({ farewell: "goodbye" });
});