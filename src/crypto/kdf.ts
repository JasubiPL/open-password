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
import { argon2id, argon2idAsync } from '@noble/hashes/argon2.js';
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
 * Parámetros Argon2id por defecto: mínimo recomendado por OWASP
 * (~19 MiB / 2 pasadas / 1 lane). Elegidos para ser usables en JS puro sobre
 * móvil (ADR 0002): Argon2id de 64 MiB en JS bloquea el dispositivo varios
 * segundos. Solo corre al registrarse/desbloquear.
 */
export const DEFAULT_ARGON2_PARAMS: Argon2Params = { t: 2, m: 19456, p: 1, dkLen: 32 };

/**
 * Parámetros Argon2id activos. Por defecto los de producción; se pueden ajustar
 * con `configureArgon2Params` para afinar por dispositivo o acelerar los tests.
 */
let activeArgon2Params: Argon2Params = DEFAULT_ARGON2_PARAMS;

/** Sobreescribe los parámetros Argon2id usados por `deriveMasterKey` por defecto. */
export function configureArgon2Params(params: Argon2Params): void {
  activeArgon2Params = params;
}

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
  params: Argon2Params = activeArgon2Params,
): Uint8Array {
  return argon2id(passwordToBytes(password), salt, {
    t: params.t,
    m: params.m,
    p: params.p,
    dkLen: params.dkLen,
  });
}

/**
 * Versión asíncrona de `deriveMasterKey`. Cede el hilo de JS periódicamente
 * para no congelar la UI mientras Argon2id corre. Usar siempre desde la app;
 * la versión síncrona se reserva para tests/uso fuera de la UI.
 */
export function deriveMasterKeyAsync(
  password: string,
  salt: Uint8Array,
  params: Argon2Params = activeArgon2Params,
): Promise<Uint8Array> {
  return argon2idAsync(passwordToBytes(password), salt, {
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
