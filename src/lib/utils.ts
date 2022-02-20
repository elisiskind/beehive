interface Expirable {
  expiration: number;
}

export const isExpired = (value: Expirable): boolean => {
  if (value.expiration < 164506570737) {
    return (value.expiration * 1000) < new Date().getTime();
  }
  return value.expiration < new Date().getTime();
}