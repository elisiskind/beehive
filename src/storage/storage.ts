export const getStorage = async (key: string): Promise<any> => {
  return (await chrome?.storage?.local?.get(key))[key];
};

export const listenForUpdates = (fieldsToWatch: {
  [field: string]: (value: any) => void;
}) => {
  if (chrome?.storage?.onChanged) {
    chrome?.storage.onChanged.addListener((changes) => {
      Object.entries(fieldsToWatch).forEach(([field, onUpdate]) => {
        if (changes[field]) {
          onUpdate(changes[field].newValue);
        }
      });
    });
  }
};
