import StorageChange = chrome.storage.StorageChange;

export const getStorage = async (key: string): Promise<any> => {
  return (await chrome?.storage?.local?.get(key))[key];
};

export const listenForUpdates = (fieldsToWatch: {
  [field: string]: (value: any) => void;
}): (() => void) => {
  if (chrome?.storage?.onChanged) {
    const listener = (changes: { [x: string]: StorageChange }) => {
      Object.entries(fieldsToWatch).forEach(([field, onUpdate]) => {
        if (changes[field]) {
          onUpdate(changes[field].newValue);
        }
      });
    };
    chrome?.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  } else {
    return () => {};
  }
};

export const requestAnswers = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id!, {
      type: "answers-request",
    });
  });
};
