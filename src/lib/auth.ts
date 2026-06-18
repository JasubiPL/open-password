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

/** Crea la cuenta, el perfil cifrado y desbloquea la bóveda en esta sesión. */
export async function register(email: string, masterPassword: string): Promise<void> {
  const normalizedEmail = normalizeEmail(email);
  const salt = generateSalt();
  await yieldToUI(); // deja pintar el overlay antes del bloqueo de Argon2id
  const masterKey = await deriveMasterKeyAsync(masterPassword, salt);
  const vaultKey = generateVaultKey();
  const protectedVaultKey = protectVaultKey(vaultKey, masterKey);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: authHashToPassword(masterKey, masterPassword),
  });
  if (error) throw mapAuthError(error);

  // El flujo cero-conocimiento necesita sesión inmediata para crear el perfil
  // cifrado (RLS exige auth.uid()). Si no hay sesión, el proyecto tiene activada
  // la confirmación de email, que este flujo no soporta.
  if (!data.session || !data.user?.id) {
    throw new Error(
      'Tu proyecto de Supabase requiere confirmar el email. Desactivá "Confirm email" ' +
        'en Authentication → Providers → Email para poder crear la bóveda.',
    );
  }

  const { error: profileError } = await supabase.from(PROFILES_TABLE).insert({
    user_id: data.user.id,
    salt: bytesToBase64(salt),
    protected_vault_key: protectedVaultKey,
  });
  if (profileError) throw profileError;

  setVaultKey(vaultKey);
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

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: authHashToPassword(masterKey, masterPassword),
  });
  if (error) throw mapAuthError(error);

  const profile = await fetchProfile();
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

/** Lee el perfil (salt + Vault Key envuelta) del usuario autenticado. */
async function fetchProfile(): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .select('salt, protected_vault_key')
    .single();
  if (error) throw error;
  if (!data) throw new Error('Perfil no encontrado.');
  return data as ProfileRow;
}
