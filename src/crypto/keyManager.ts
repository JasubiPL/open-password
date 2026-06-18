/**
 * Gestión de la Vault Key. Ver ADR 0002.
 *
 * La Vault Key es una clave AES-256 aleatoria que cifra todos los datos del
 * usuario. Se guarda en el servidor **envuelta** (cifrada con la Master Key),
 * de modo que el servidor nunca la ve en claro.
 *
 * En tiempo de ejecución la Vault Key vive **solo en RAM** (módulo singleton).
 * Opcionalmente, para desbloqueo biométrico, puede persistirse en el almacén
 * seguro del dispositivo (`expo-secure-store`, respaldado por Keychain/Keystore).
 */
import * as SecureStore from 'expo-secure-store';
import { KEY_LENGTH, decryptString, encryptString } from './cipher';
import { randomBytes } from './random';
import { base64ToBytes, bytesToBase64 } from './encoding';

const SECURE_STORE_KEY = 'open-password.vault-key';

/** Vault Key en RAM. `null` cuando la bóveda está bloqueada. */
let vaultKeyInMemory: Uint8Array | null = null;

/** Genera una nueva Vault Key AES-256 aleatoria. */
export function generateVaultKey(): Uint8Array {
  return randomBytes(KEY_LENGTH);
}

/**
 * Envuelve (cifra) la Vault Key con la Master Key para guardarla en el servidor.
 * Devuelve `base64(iv || ciphertext)`.
 */
export function protectVaultKey(vaultKey: Uint8Array, masterKey: Uint8Array): string {
  return encryptString(masterKey, bytesToBase64(vaultKey));
}

/** Desenvuelve la Vault Key usando la Master Key. Lanza si la clave es incorrecta. */
export function unprotectVaultKey(protectedVaultKey: string, masterKey: Uint8Array): Uint8Array {
  return base64ToBytes(decryptString(masterKey, protectedVaultKey));
}

// --- Estado en RAM ---------------------------------------------------------

/** Carga la Vault Key en memoria (desbloquea la bóveda en esta sesión). */
export function setVaultKey(vaultKey: Uint8Array): void {
  vaultKeyInMemory = vaultKey;
}

/** Devuelve la Vault Key en memoria o lanza si la bóveda está bloqueada. */
export function getVaultKey(): Uint8Array {
  if (!vaultKeyInMemory) {
    throw new Error('Bóveda bloqueada: no hay Vault Key en memoria');
  }
  return vaultKeyInMemory;
}

export function isUnlocked(): boolean {
  return vaultKeyInMemory !== null;
}

/** Borra la Vault Key de la RAM (bloquea la bóveda). */
export function clearVaultKey(): void {
  if (vaultKeyInMemory) vaultKeyInMemory.fill(0);
  vaultKeyInMemory = null;
}

// --- Persistencia para biometría (expo-secure-store) -----------------------

/**
 * Guarda la Vault Key en el almacén seguro del dispositivo para desbloqueo
 * biométrico.
 *
 * NO usamos `requireAuthentication`: con esa opción el SO pide biometría también
 * al ESCRIBIR, lo que dispara un prompt inesperado durante el enrolamiento (justo
 * tras el login). En su lugar, el acceso se controla con un `authenticateAsync`
 * explícito al desbloquear (ver `unlockWithBiometrics`). La clave queda igual
 * protegida en reposo con `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (Keychain/Keystore,
 * solo este dispositivo, solo con el equipo desbloqueado). Trade-off de
 * conveniencia aceptado para el MVP; ver ADR 0002.
 */
export async function saveVaultKeyToSecureStore(vaultKey: Uint8Array): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, bytesToBase64(vaultKey), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

/** Recupera la Vault Key del almacén seguro, o `null` si no existe. */
export async function loadVaultKeyFromSecureStore(): Promise<Uint8Array | null> {
  const stored = await SecureStore.getItemAsync(SECURE_STORE_KEY, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return stored ? base64ToBytes(stored) : null;
}

/** Elimina la Vault Key del almacén seguro (desactiva biometría). */
export async function deleteVaultKeyFromSecureStore(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
}
