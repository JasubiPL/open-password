/**
 * Desbloqueo biométrico (Face ID / huella) con `expo-local-authentication`.
 *
 * La Vault Key se guarda en `expo-secure-store` con `requireAuthentication`, de
 * modo que el SO exige biometría para leerla. Aquí añadimos un prompt explícito
 * y helpers de disponibilidad. Ver ADR 0002.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import {
  deleteVaultKeyFromSecureStore,
  loadVaultKeyFromSecureStore,
  saveVaultKeyToSecureStore,
  setVaultKey,
} from '@/crypto';

/** True si el dispositivo tiene hardware biométrico configurado y enrolado. */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

/** Habilita el desbloqueo biométrico guardando la Vault Key (actual) en el secure store. */
export async function enableBiometricUnlock(vaultKey: Uint8Array): Promise<void> {
  await saveVaultKeyToSecureStore(vaultKey);
}

/** Desactiva el desbloqueo biométrico borrando la Vault Key del secure store. */
export async function disableBiometricUnlock(): Promise<void> {
  await deleteVaultKeyFromSecureStore();
}

/**
 * Pide biometría y, si pasa, carga la Vault Key en RAM. Devuelve true si
 * desbloqueó. El propio `getItemAsync` con `requireAuthentication` ya exige
 * biometría; el prompt previo mejora la UX y permite cancelar limpio.
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
  return true;
}
