interface Expirable {
  expiration: number;
}

export const isExpired = (value: Expirable): boolean => {
  if (value.expiration < 164506570737) {
    return value.expiration * 1000 < new Date().getTime();
  }
  return value.expiration < new Date().getTime();
};

export enum ExecutionContext {
  CONTENT_SCRIPT = 'content-script',
  BACKGROUND = 'background',
  POPUP = 'popup',
}

export const executionContext = (): ExecutionContext => {
  if (location?.protocol == "chrome-extension:") { // eslint-disable-line no-restricted-globals
    if (typeof window === 'undefined') {
      return ExecutionContext.BACKGROUND;
    } else {
      return ExecutionContext.POPUP;
    }
  } else {
    return ExecutionContext.CONTENT_SCRIPT;
  }
};