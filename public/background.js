chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.onActivated.addListener(async (info) => {
    const tab = await chrome.tabs.get(info.tabId);
    const enabled =
      tab.url.indexOf("https://www.nytimes.com/puzzles/spelling-bee") !== -1;
    enabled
      ? await chrome.action.enable(info.tabId)
      : await chrome.action.disable(info.tabId);
    console.log("Enabled: " + enabled);
  });
});

chrome.runtime.onMessage.addListener(async (request) => {
  console.log(request);
  if (request.guesses) {
    await chrome.storage.local.set({ guesses: request.guesses });
  }
  if (request.answers) {
    await chrome.storage.local.set({ answers: request.answers });
  }
});
