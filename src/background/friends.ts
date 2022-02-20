import { FriendCode } from "../lib/interfaces";

export const generateFriendCode = (userId: string): FriendCode => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let generated = '';
  for (let i = 0; i < 6; i++) {
    generated += chars[Math.floor(Math.random() * chars.length)];
  }
  return {
    expiration: new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getTime(),
    userId: userId,
    code: generated
  };
}