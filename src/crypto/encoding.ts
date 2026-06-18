/**
 * Helpers de codificación independientes de plataforma.
 *
 * React Native no expone `btoa`/`atob`/`Buffer` de forma fiable, así que
 * implementamos base64 (estándar y URL-safe) sobre `Uint8Array` a mano.
 * UTF-8 se delega en los helpers de `@noble/hashes`.
 */
import { utf8ToBytes as nobleUtf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils.js';

const B64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP: Record<string, number> = {};
for (let i = 0; i < B64_ALPHABET.length; i++) B64_LOOKUP[B64_ALPHABET[i]] = i;

/** Normaliza una contraseña a NFKC y la pasa a bytes UTF-8. */
export function passwordToBytes(password: string): Uint8Array {
  return nobleUtf8ToBytes(password.normalize('NFKC'));
}

export function utf8ToBytes(text: string): Uint8Array {
  return nobleUtf8ToBytes(text);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  // TextDecoder existe en Hermes/RN modernos y en Node.
  return new TextDecoder().decode(bytes);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += B64_ALPHABET[(n >> 18) & 63] + B64_ALPHABET[(n >> 12) & 63] + B64_ALPHABET[(n >> 6) & 63] + B64_ALPHABET[n & 63];
  }
  const rem = bytes.length - i;
  if (rem === 1) {
    const n = bytes[i] << 16;
    out += B64_ALPHABET[(n >> 18) & 63] + B64_ALPHABET[(n >> 12) & 63] + '==';
  } else if (rem === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += B64_ALPHABET[(n >> 18) & 63] + B64_ALPHABET[(n >> 12) & 63] + B64_ALPHABET[(n >> 6) & 63] + '=';
  }
  return out;
}

export function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const padded = clean.length % 4 === 0 ? clean : clean + '='.repeat(4 - (clean.length % 4));
  const len = padded.length;
  const bytesLen = (len / 4) * 3 - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
  const out = new Uint8Array(bytesLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const n =
      (B64_LOOKUP[padded[i]] << 18) |
      (B64_LOOKUP[padded[i + 1]] << 12) |
      ((B64_LOOKUP[padded[i + 2]] ?? 0) << 6) |
      (B64_LOOKUP[padded[i + 3]] ?? 0);
    if (p < bytesLen) out[p++] = (n >> 16) & 255;
    if (p < bytesLen) out[p++] = (n >> 8) & 255;
    if (p < bytesLen) out[p++] = n & 255;
  }
  return out;
}

export { bytesToHex, hexToBytes };
