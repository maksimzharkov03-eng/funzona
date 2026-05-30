import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PREFIX = "scrypt";
const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${PREFIX}$${salt}$${derived}`;
}

export function isPasswordHash(value: string) {
  return value.startsWith(`${PREFIX}$`);
}

export function verifyPassword(password: string, storedPassword: string) {
  if (!isPasswordHash(storedPassword)) return password === storedPassword;

  const [, salt, storedHex] = storedPassword.split("$");
  if (!salt || !storedHex) return false;

  try {
    const stored = Buffer.from(storedHex, "hex");
    const derived = scryptSync(password, salt, stored.length);
    return stored.length === derived.length && timingSafeEqual(stored, derived);
  } catch {
    return false;
  }
}
