/**
 * Servicio de autenticación cero-conocimiento. Orquesta el núcleo de cripto
 * (Fase 1) con Supabase Auth (ADR 0002 + 0003).
 *
 * Lo que el servidor ve nunca permite descifrar nada:
 *  - Supabase Auth recibe como "password" el `authHash` derivado (no la maestra).
 *  - `profiles` guarda el `salt` y la Vault Key **envuelta** con la Master Key.
 *
 * Flujos:
 *  - register: crea cuenta + perfil y deja la bóveda desbloqueada en RAM.
 *  - login (dispositivo nuevo): prelogin → deriva → autentica → desenvuelve.
 *  - unlock (sesión ya presente): re-deriva con la maestra y desenvuelve.
 */
import { supabase } from './supabase';
import {
  bytesToBase64,
  deriveAuthHash,
  deriveMasterKeyAsync,
  generateSalt,
  generateVaultKey,
  protectVaultKey,
  setVaultKey,
  unprotectVaultKey,
  base64ToBytes,
  clearVaultKey,
} from '@/crypto';

const PROFILES_TABLE = 'profiles';

interface ProfileRow {
  salt: string;
  protected_vault_key: string;
}

/** Codifica el auth hash como string para usarlo como password en Supabase. */
function authHashToPassword(masterKey: Uint8Array, password: string): string {
  return bytesToBase64(deriveAuthHash(masterKey, password));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Cede el hilo de JS un macrotask (setTimeout) para que React pueda pintar el
 * overlay de carga ANTES de que Argon2id bloquee el hilo. `await nextTick` de
 * noble usa microtasks y no basta: no devuelven control a React Native.
 */
function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Traduce errores de Supabase a mensajes claros para el usuario. */
function mapAuthError(error: { message?: string }): Error {
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('already registered') || msg.includes('already exists')) {
    return new Error('Ya existe una cuenta con ese email. Iniciá sesión.');
  }
  if (msg.includes('rate limit')) {
    return new Error(
      'Supabase limitó el envío de emails por demasiados intentos. Esperá un rato, ' +
        'o desactivá "Confirm email" en Supabase para no enviar correos.',
    );
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return new Error('Email o contraseña maestra incorrectos.');
  }
  return new Error(error.message ?? 'Error de autenticación.');
}

/** Resultado del registro: bóveda lista, o falta confirmar el email. */
export type RegisterResult = 'unlocked' | 'emailConfirmationRequired';

/**
 * Crea la cuenta y el perfil cifrado.
 *
 * El `salt` y la Vault Key envuelta se guardan SIEMPRE en `user_metadata` al
 * registrarse (no requiere sesión): así, si el proyecto exige confirmar el email,
 * los datos no se pierden y el perfil se materializa en el primer login.
 * Si hay sesión inmediata (confirmación desactivada), se crea el perfil y se
 * desbloquea la bóveda en el acto.
 */
export async function register(email: string, masterPassword: string): Promise<RegisterResult> {
  const normalizedEmail = normalizeEmail(email);
  const salt = generateSalt();
  const saltB64 = bytesToBase64(salt);
  await yieldToUI(); // deja pintar el overlay antes del bloqueo de Argon2id
  const masterKey = await deriveMasterKeyAsync(masterPassword, salt);
  const vaultKey = generateVaultKey();
  const protectedVaultKey = protectVaultKey(vaultKey, masterKey);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: authHashToPassword(masterKey, masterPassword),
    // user_metadata: salt (no secreto) + Vault Key cifrada (segura aunque se exponga).
    options: { data: { salt: saltB64, protected_vault_key: protectedVaultKey } },
  });
  if (error) throw mapAuthError(error);

  // Sin sesión → el proyecto exige confirmar el email. Los datos quedan en
  // user_metadata; el perfil se crea al confirmar e iniciar sesión.
  if (!data.session || !data.user?.id) {
    return 'emailConfirmationRequired';
  }

  await upsertProfile(data.user.id, saltB64, protectedVaultKey);
  setVaultKey(vaultKey);
  return 'unlocked';
}

/** Reenvía el email de confirmación de registro. */
export async function resendConfirmationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({ type: 'signup', email: normalizeEmail(email) });
  if (error) throw mapAuthError(error);
}

/** Devuelve el salt (base64) de un email vía RPC prelogin, o null si no existe. */
export async function prelogin(email: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_salt_by_email', {
    p_email: normalizeEmail(email),
  });
  if (error) throw error;
  return (data as string | null) ?? null;
}

/** Inicia sesión en un dispositivo nuevo y desbloquea la bóveda. */
export async function login(email: string, masterPassword: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const saltB64 = await prelogin(normalizedEmail);
  if (!saltB64) {
    throw new Error('No existe una cuenta con ese email.');
  }
  const salt = base64ToBytes(saltB64);
  await yieldToUI(); // deja pintar el overlay antes del bloqueo de Argon2id
  const masterKey = await deriveMasterKeyAsync(masterPassword, salt);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: authHashToPassword(masterKey, masterPassword),
  });
  if (error) throw mapAuthError(error);

  // Cuentas creadas con confirmación de email aún no tienen fila en `profiles`
  // (su salt/Vault Key viven en user_metadata): la materializamos en el primer
  // login para que el resto de la app y el prelogin de otros dispositivos funcionen.
  const profile = await ensureProfile(data.user, saltB64);
  const vaultKey = unprotectVaultKey(profile.protected_vault_key, masterKey);
  setVaultKey(vaultKey);
}

/**
 * Desbloquea la bóveda cuando ya hay sesión de Supabase (re-apertura/auto-lock).
 * Re-deriva la Master Key con la contraseña maestra y desenvuelve la Vault Key.
 */
export async function unlock(masterPassword: string): Promise<void> {
  const profile = await fetchProfile();
  const salt = base64ToBytes(profile.salt);
  await yieldToUI(); // deja pintar el overlay antes del bloqueo de Argon2id
  const masterKey = await deriveMasterKeyAsync(masterPassword, salt);
  // unprotect lanza si la contraseña es incorrecta (fallo de autenticación GCM).
  const vaultKey = unprotectVaultKey(profile.protected_vault_key, masterKey);
  setVaultKey(vaultKey);
}

/** Cierra sesión: limpia la Vault Key de RAM y termina la sesión de Supabase. */
export async function logout(): Promise<void> {
  clearVaultKey();
  await supabase.auth.signOut();
}

/** Lee el perfil (salt + Vault Key envuelta) del usuario autenticado, o null. */
async function fetchProfileOrNull(): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select('salt, protected_vault_key')
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

/** Lee el perfil del usuario autenticado; lanza si no existe. */
async function fetchProfile(): Promise<ProfileRow> {
  const profile = await fetchProfileOrNull();
  if (!profile) throw new Error('Perfil no encontrado.');
  return profile;
}

/** Crea o actualiza el perfil cifrado del usuario. */
async function upsertProfile(userId: string, saltB64: string, protectedVaultKey: string): Promise<void> {
  const { error } = await supabase
    .from(PROFILES_TABLE)
    .upsert(
      { user_id: userId, salt: saltB64, protected_vault_key: protectedVaultKey },
      { onConflict: 'user_id' },
    );
  if (error) throw error;
}

interface AuthUser {
  id: string;
  user_metadata?: { salt?: string; protected_vault_key?: string };
}

/**
 * Garantiza que exista el perfil en `profiles`. Si falta (cuenta creada con
 * confirmación de email), lo materializa desde `user_metadata`.
 */
async function ensureProfile(user: AuthUser | null | undefined, saltB64: string): Promise<ProfileRow> {
  const existing = await fetchProfileOrNull();
  if (existing) return existing;

  const meta = user?.user_metadata ?? {};
  const protectedVaultKey = meta.protected_vault_key;
  const metaSalt = meta.salt ?? saltB64;
  if (!user?.id || !protectedVaultKey) {
    throw new Error('Perfil no encontrado y faltan datos para recrearlo.');
  }
  await upsertProfile(user.id, metaSalt, protectedVaultKey);
  return { salt: metaSalt, protected_vault_key: protectedVaultKey };
}
