/**
 * Fuente única de aleatoriedad criptográfica (CSPRNG).
 *
 * Aislada en su propio módulo para (a) cumplir el ADR 0002 — usar el CSPRNG de
 * `expo-crypto` — y (b) poder mockearla fácilmente en tests.
 */
import * as Crypto from 'expo-crypto';

/** Devuelve `length` bytes aleatorios criptográficamente seguros. */
export function randomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError(`randomBytes: length inválida (${length})`);
  }
  return Crypto.getRandomBytes(length);
}
