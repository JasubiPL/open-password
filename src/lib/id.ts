import * as Crypto from 'expo-crypto';

/** Genera un identificador único (UUID v4) para bóvedas e items. */
export function newId(): string {
  return Crypto.randomUUID();
}
