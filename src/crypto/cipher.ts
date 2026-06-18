/**
 * Cifrado simétrico autenticado con AES-256-GCM. Ver ADR 0002.
 *
 * Cada operación de cifrado usa un IV de 12 bytes aleatorio (recomendación NIST
 * para GCM). El formato serializado es `base64(iv || ciphertext)`, donde el
 * ciphertext de `@noble/ciphers` ya incluye el tag de autenticación de 16 bytes.
 */
import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from './random';
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from './encoding';

export const KEY_LENGTH = 32; // AES-256
export const IV_LENGTH = 12; // 96 bits, óptimo para GCM

export interface EncryptedBlob {
  /** IV/nonce aleatorio de 12 bytes. */
  iv: Uint8Array;
  /** Ciphertext + tag GCM de 16 bytes. */
  ciphertext: Uint8Array;
}

function assertKey(key: Uint8Array): void {
  if (key.length !== KEY_LENGTH) {
    throw new RangeError(`La clave debe ser de ${KEY_LENGTH} bytes (AES-256), recibidos ${key.length}`);
  }
}

/** Cifra bytes con AES-256-GCM. `aad` opcional se autentica pero no se cifra. */
export function encryptBytes(key: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): EncryptedBlob {
  assertKey(key);
  const iv = randomBytes(IV_LENGTH);
  const ciphertext = gcm(key, iv, aad).encrypt(plaintext);
  return { iv, ciphertext };
}

/** Descifra un blob AES-256-GCM. Lanza si la autenticación falla. */
export function decryptBytes(key: Uint8Array, blob: EncryptedBlob, aad?: Uint8Array): Uint8Array {
  assertKey(key);
  return gcm(key, blob.iv, aad).decrypt(blob.ciphertext);
}

/**
 * Cifra texto y devuelve `base64(iv || ciphertext)`, listo para guardar.
 */
export function encryptString(key: Uint8Array, plaintext: string, aad?: Uint8Array): string {
  const { iv, ciphertext } = encryptBytes(key, utf8ToBytes(plaintext), aad);
  const packed = new Uint8Array(iv.length + ciphertext.length);
  packed.set(iv, 0);
  packed.set(ciphertext, iv.length);
  return bytesToBase64(packed);
}

/** Descifra una cadena producida por `encryptString`. */
export function decryptString(key: Uint8Array, packedBase64: string, aad?: Uint8Array): string {
  const packed = base64ToBytes(packedBase64);
  if (packed.length <= IV_LENGTH) {
    throw new Error('Ciphertext inválido: demasiado corto');
  }
  const iv = packed.slice(0, IV_LENGTH);
  const ciphertext = packed.slice(IV_LENGTH);
  return bytesToUtf8(decryptBytes(key, { iv, ciphertext }, aad));
}
