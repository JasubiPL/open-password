/**
 * Cifrado de registros (bóvedas e items) con la Vault Key en RAM.
 *
 * Cada registro se serializa a JSON y se cifra con AES-256-GCM (ver `cipher.ts`).
 * Solo los campos sensibles van en el blob cifrado; `id`, `vault_id` y los
 * timestamps quedan como metadatos en claro (ver ADR 0002 / 0003).
 */
import { decryptString, encryptString, getVaultKey } from '@/crypto';

/** Cifra un objeto y devuelve el blob `base64(iv || ciphertext)`. */
export function encryptRecord(record: unknown): string {
  return encryptString(getVaultKey(), JSON.stringify(record));
}

/** Descifra un blob a su objeto original. Lanza si la Vault Key es incorrecta. */
export function decryptRecord<T>(ciphertext: string): T {
  return JSON.parse(decryptString(getVaultKey(), ciphertext)) as T;
}
