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
 * Parámetros Argon2id por defecto para cuentas NUEVAS.
 *
 * Argon2id en JS puro corre en el ÚNICO hilo de JS de React Native y lo bloquea
 * mientras dura (no hay workers en Expo Go; ver ADR 0002). En Hermes (sin JIT)
 * incluso 8 MiB / 2 pasadas tardaba ~30 s en gama media, lo que hacía el login y
 * el unlock por contraseña inusables. Bajamos a ~2 MiB / 1 pasada para que el
 * bloqueo sea de unos segundos. Es más débil que el mínimo OWASP (~19 MiB): el
 * camino para subirlo sin penalización es un dev build con Argon2 NATIVO.
 *
 * Estos parámetros se guardan **por usuario** (junto al salt), así que se pueden
 * cambiar para cuentas futuras sin romper las existentes (cada cuenta deriva con
 * los suyos). Ver `LEGACY_ARGON2_PARAMS` y `normalizeArgon2Params`.
 */
export const DEFAULT_ARGON2_PARAMS: Argon2Params = { t: 1, m: 2048, p: 1, dkLen: 32 };

/**
 * Parámetros de las cuentas creadas antes de guardar params por usuario. Cuando
 * el servidor no devuelve `kdf_params` (cuenta legacy), derivamos con estos para
 * no romper el login/unlock de esas cuentas.
 */
export const LEGACY_ARGON2_PARAMS: Argon2Params = { t: 2, m: 8192, p: 1, dkLen: 32 };

/**
 * Valida y normaliza unos params Argon2 venidos del servidor (jsonb). Si faltan
 * o son inválidos (cuenta legacy), devuelve `LEGACY_ARGON2_PARAMS`.
 */
export function normalizeArgon2Params(raw: unknown): Argon2Params {
  if (raw && typeof raw === 'object') {
    const p = raw as Record<string, unknown>;
    const ok = (['t', 'm', 'p', 'dkLen'] as const).every(
      (k) => typeof p[k] === 'number' && (p[k] as number) > 0,
    );
    if (ok) return { t: p.t as number, m: p.m as number, p: p.p as number, dkLen: p.dkLen as number };
  }
  return LEGACY_ARGON2_PARAMS;
}

/**
 * Parámetros Argon2id activos. Por defecto los de producción; se pueden ajustar
 * con `configureArgon2Params` para afinar por dispositivo o acelerar los tests.
 */
let activeArgon2Params: Argon2Params = DEFAULT_ARGON2_PARAMS;

/** Sobreescribe los parámetros Argon2id usados por `deriveMasterKey` por defecto. */
export function configureArgon2Params(params: Argon2Params): void {
  activeArgon2Params = params;
}

/**
 * Params Argon2id activos: los que usa una cuenta NUEVA al registrarse (se
 * guardan junto a su salt). Por defecto `DEFAULT_ARGON2_PARAMS`; los tests los
 * bajan con `configureArgon2Params`.
 */
export function getActiveArgon2Params(): Argon2Params {
  return activeArgon2Params;
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
