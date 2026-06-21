/**
 * Notificaciones locales del sistema (Fase post-MVP).
 *
 * Se usa para avisar al usuario cuando un sync subió a la nube sus claves locales
 * pendientes (p. ej. tras reconectarse). `expo-notifications` se carga de forma
 * perezosa (lazy `require`) para no tocar módulos nativos en Node/tests, y todo
 * es best-effort: si no hay permiso o el módulo no está, simplemente no notifica.
 *
 * El mensaje es **genérico** (no revela títulos ni datos de las entradas), apto
 * para mostrarse en la pantalla de bloqueo.
 */
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';

/**
 * Expo Go (SDK 53+) ya no incluye `expo-notifications`: cargarlo ahí lanza un
 * error ruidoso. Detectamos Expo Go para no tocar el módulo y degradar en
 * silencio; en development/standalone builds funciona normal.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cached: typeof ExpoNotifications | null | undefined;

function getModule(): typeof ExpoNotifications | null {
  if (cached !== undefined) return cached;
  if (isExpoGo) {
    cached = null;
    return cached;
  }
  try {
    cached = require('expo-notifications') as typeof ExpoNotifications;
  } catch {
    cached = null;
  }
  return cached;
}

let configured = false;

/** Configura el handler para que las notificaciones se muestren en foreground. */
export function setupNotifications(): void {
  if (configured) return;
  const N = getModule();
  if (!N) return;
  configured = true;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true, // sonido por defecto del teléfono
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(N: typeof ExpoNotifications): Promise<boolean> {
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await N.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Notifica que se subieron `count` cambios locales a la nube. No-op si el módulo
 * no está disponible o el usuario no dio permiso.
 */
export async function notifyKeysSynced(count: number): Promise<void> {
  const N = getModule();
  if (!N) return;
  try {
    setupNotifications();
    if (!(await ensurePermission(N))) return;
    await N.scheduleNotificationAsync({
      content: {
        title: 'Open Password',
        body:
          count > 1
            ? `Tus ${count} claves locales se sincronizaron en la nube ✓`
            : 'Tu clave local se sincronizó en la nube ✓',
        sound: 'default', // sonido por defecto del sistema
      },
      trigger: null, // inmediata
    });
  } catch {
    /* best-effort */
  }
}
