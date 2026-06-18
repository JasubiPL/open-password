/**
 * Desbloqueo biométrico (Face ID / huella) con `expo-local-authentication` +
 * `expo-secure-store`. Ver ADR 0002.
 *
 * La Vault Key se guarda en el secure store con `requireAuthentication`, de modo
 * que es el propio SO (Keychain/Keystore) quien exige biometría para leerla. No
 * añadimos un `authenticateAsync` previo: provocaría un **doble prompt** y la
 * lectura del keychain ya es la barrera real. Si el usuario cancela, la lectura
 * lanza y caemos al desbloqueo por contraseña.
 *
 * El enrolamiento (guardar la Vault Key) ocurre tras un desbloqueo con
 * contraseña satisfactorio —ver `syncBiometricEnrollment`—; antes de eso no hay
 * clave guardada y el botón de biometría no debe ofrecerse.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  deleteVaultKeyFromSecureStore,
  getVaultKey,
  loadVaultKeyFromSecureStore,
  saveVaultKeyToSecureStore,
  setVaultKey,
} from '@/crypto';

/**
 * Flag (no sensible) que marca que el usuario ya habilitó el biométrico en este
 * dispositivo. Vive sin `requireAuthentication` para poder consultarlo sin pedir
 * biometría y así decidir si mostrar el botón de desbloqueo.
 */
const BIOMETRIC_FLAG_KEY = 'open-password.biometric-enabled';

/** True si el dispositivo tiene hardware biométrico configurado y enrolado. */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

/**
 * True si el desbloqueo biométrico está habilitado en este dispositivo: hay
 * hardware enrolado **y** existe una Vault Key guardada para biometría.
 */
export async function isBiometricEnabled(): Promise<boolean> {
  if (!(await isBiometricAvailable())) return false;
  const flag = await SecureStore.getItemAsync(BIOMETRIC_FLAG_KEY);
  return flag === '1';
}

/** Habilita el desbloqueo biométrico guardando la Vault Key en el secure store. */
export async function enableBiometricUnlock(vaultKey: Uint8Array): Promise<void> {
  await saveVaultKeyToSecureStore(vaultKey);
  await SecureStore.setItemAsync(BIOMETRIC_FLAG_KEY, '1');
}

/** Desactiva el desbloqueo biométrico borrando la Vault Key del secure store. */
export async function disableBiometricUnlock(): Promise<void> {
  await deleteVaultKeyFromSecureStore();
  await SecureStore.deleteItemAsync(BIOMETRIC_FLAG_KEY);
}

/**
 * Habilita el biométrico (best-effort) tras un desbloqueo con contraseña,
 * usando la Vault Key que ya está en RAM. No-op si no hay hardware o si ya
 * estaba habilitado. Pensado para llamarse desde el store de sesión después de
 * `login`/`unlock`/`register`. Si falla, el desbloqueo por contraseña sigue
 * funcionando, así que tragamos el error.
 */
export async function syncBiometricEnrollment(): Promise<void> {
  try {
    if (!(await isBiometricAvailable())) return;
    if (await isBiometricEnabled()) return;
    await enableBiometricUnlock(getVaultKey());
  } catch {
    /* best-effort: el enrolamiento es opcional */
  }
}

/**
 * Pide biometría con un prompt explícito y, si pasa, carga la Vault Key en RAM.
 * Devuelve `true` si desbloqueó, `false` si el usuario canceló o no había clave
 * guardada. La clave se guarda sin `requireAuthentication` (ver `keyManager`),
 * así que este `authenticateAsync` ES la barrera biométrica.
 */
export async function unlockWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloqueá tu bóveda',
    cancelLabel: 'Usar contraseña',
    disableDeviceFallback: false,
  });
  if (!result.success) return false;

  const vaultKey = await loadVaultKeyFromSecureStore();
  if (!vaultKey) return false;

  setVaultKey(vaultKey);

  // Auto-migración: cuentas enroladas antes de quitar `requireAuthentication`
  // dejaron un ítem con ACL biométrica que pide autenticación TAMBIÉN al leer
  // (doble prompt). Re-guardarlo con la ACL actual (sin requireAuthentication)
  // lo migra; los próximos desbloqueos piden biometría una sola vez.
  await saveVaultKeyToSecureStore(vaultKey).catch(() => {});
  return true;
}
