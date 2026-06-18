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
 * Params recomendados para builds con **Argon2id nativo** (`registerNativeArgon2`),
 * donde el coste no penaliza la UX: ~64 MiB / 3 pasadas (por encima del mínimo
 * OWASP de ~19 MiB). Como los params se guardan por usuario, se puede cambiar
 * `DEFAULT_ARGON2_PARAMS` a estos para cuentas NUEVAS sin romper las existentes.
 * Ver ADR 0005.
 */
export const STRONG_ARGON2_PARAMS: Argon2Params = { t: 3, m: 65536, p: 1, dkLen: 32 };

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

// --- Argon2id nativo (opcional, para dev/prod builds) ----------------------
//
// En Expo Go solo corre el Argon2id en JS puro (lento en Hermes). En un build
// nativo se puede registrar un Argon2id nativo (rápido) con `registerNativeArgon2`.
// CLAVE: Argon2id es un estándar, así que un módulo nativo correcto produce los
// MISMOS bytes que `@noble` para los mismos parámetros e inputs. Antes de usar el
// nativo lo VALIDAMOS contra `@noble` con un vector de prueba (`nativeIsTrustworthy`);
// si no coincide (p. ej. el módulo codifica el salt distinto), caemos a JS. Así
// nunca se puede bloquear a un usuario por un nativo incompatible. Ver ADR 0005.

/** Firma de un Argon2id nativo: recibe bytes y devuelve la clave derivada. */
export type NativeArgon2 = (
  password: Uint8Array,
  salt: Uint8Array,
  params: Argon2Params,
) => Promise<Uint8Array>;

let nativeArgon2: NativeArgon2 | null = null;
let nativeVerified: boolean | null = null; // null = sin probar todavía

/** Registra (o limpia con `null`) un Argon2id nativo. Se valida antes de usarse. */
export function registerNativeArgon2(fn: NativeArgon2 | null): void {
  nativeArgon2 = fn;
  nativeVerified = null;
}

const SELF_TEST_PARAMS: Argon2Params = { t: 1, m: 256, p: 1, dkLen: 32 };
const SELF_TEST_PASSWORD = passwordToBytes('open-password::argon2-selftest');
const SELF_TEST_SALT = Uint8Array.from(
  [11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132, 143, 154, 165, 176].map((n) => n & 0xff),
);

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** True si el nativo produce el MISMO resultado que `@noble` en un vector de prueba. */
async function nativeIsTrustworthy(): Promise<boolean> {
  if (nativeVerified !== null) return nativeVerified;
  if (!nativeArgon2) return (nativeVerified = false);
  try {
    const reference = argon2id(SELF_TEST_PASSWORD, SELF_TEST_SALT, { ...SELF_TEST_PARAMS });
    const got = await nativeArgon2(SELF_TEST_PASSWORD, SELF_TEST_SALT, SELF_TEST_PARAMS);
    nativeVerified = bytesEqual(reference, got);
  } catch {
    nativeVerified = false;
  }
  return nativeVerified;
}

/**
 * Versión asíncrona de `deriveMasterKey`. Usa el Argon2id nativo si está
 * registrado y validado; si no, el JS puro de `@noble` (que cede el hilo
 * periódicamente para no congelar la UI). Usar siempre desde la app.
 */
export async function deriveMasterKeyAsync(
  password: string,
  salt: Uint8Array,
  params: Argon2Params = activeArgon2Params,
): Promise<Uint8Array> {
  const pw = passwordToBytes(password);
  if (await nativeIsTrustworthy()) {
    try {
      return await nativeArgon2!(pw, salt, params);
    } catch {
      /* el nativo falló en runtime: caemos a JS */
    }
  }
  return argon2idAsync(pw, salt, { t: params.t, m: params.m, p: params.p, dkLen: params.dkLen });
}

/**
 * Deriva el auth hash que se envía a Supabase Auth como contraseña.
 * Una pasada de PBKDF2 basta para separar dominios: la Master Key ya es cara de
 * computar, y esto garantiza authHash !== masterKey.
 */
export function deriveAuthHash(masterKey: Uint8Array, password: string): Uint8Array {
  return pbkdf2(sha256, masterKey, passwordToBytes(password), { c: 1, dkLen: 32 });
}
