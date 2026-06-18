/**
 * Derivación de claves (KDF) — cero-conocimiento. Ver ADR 0002.
 *
 * A partir de la contraseña maestra y un salt por usuario derivamos:
 *  - Master Key (Argon2id): clave que cifra/descifra la Vault Key. Nunca sale
 *    del dispositivo.
 *  - Auth hash: valor distinto, derivado de la Master Key, que se usa como
 *    "password" en Supabase Auth. El servidor solo ve este hash, nunca la
 *    contraseña ni la Master Key. Aunque se filtre, no permite descifrar nada.
 *
 * Estilo Bitwarden: authHash = PBKDF2(masterKey, password) con dominio separado.
 */
import { argon2id } from '@noble/hashes/argon2.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { passwordToBytes } from './encoding';
import { randomBytes } from './random';

export interface Argon2Params {
  /** Iteraciones (time cost). */
  t: number;
  /** Memoria en KiB (memory cost). */
  m: number;
  /** Paralelismo (lanes). */
  p: number;
  /** Longitud de la clave derivada en bytes. */
  dkLen: number;
}

/**
 * Parámetros Argon2id por defecto. ~64 MiB / 3 pasadas: balance razonable para
 * dispositivos móviles dado que solo corre al desbloquear (ADR 0002).
 */
export const DEFAULT_ARGON2_PARAMS: Argon2Params = { t: 3, m: 64 * 1024, p: 4, dkLen: 32 };

export const SALT_LENGTH = 16;

/** Genera un salt aleatorio por usuario (se guarda junto al perfil). */
export function generateSalt(length: number = SALT_LENGTH): Uint8Array {
  return randomBytes(length);
}

/**
 * Deriva la Master Key (32 bytes) desde la contraseña maestra y el salt.
 * Determinista para una misma (password, salt, params).
 */
export function deriveMasterKey(
  password: string,
  salt: Uint8Array,
  params: Argon2Params = DEFAULT_ARGON2_PARAMS,
): Uint8Array {
  return argon2id(passwordToBytes(password), salt, {
    t: params.t,
    m: params.m,
    p: params.p,
    dkLen: params.dkLen,
  });
}

/**
 * Deriva el auth hash que se envía a Supabase Auth como contraseña.
 * Una pasada de PBKDF2 basta para separar dominios: la Master Key ya es cara de
 * computar, y esto garantiza authHash !== masterKey.
 */
export function deriveAuthHash(masterKey: Uint8Array, password: string): Uint8Array {
  return pbkdf2(sha256, masterKey, passwordToBytes(password), { c: 1, dkLen: 32 });
}
