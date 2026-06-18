import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as ScreenCapture from 'expo-screen-capture';
import { useSession } from '@/store/session';
import { useVaults } from '@/store/vaults';
import { usePreferences } from '@/store/preferences';

/**
 * Guardas de seguridad de Fase 6 (sin UI):
 *  - **Auto-bloqueo:** al volver del segundo plano, si pasó más del umbral
 *    configurado, limpia la Vault Key de RAM (la app pide desbloqueo otra vez).
 *    Con umbral 0 ("Al salir") bloquea apenas la app pasa a segundo plano.
 *  - **Bloqueo de capturas:** activa/desactiva `expo-screen-capture` según la
 *    preferencia (FLAG_SECURE en Android; difuminado en iOS).
 */
export function SecurityGuards() {
  const blockScreenshots = usePreferences((s) => s.blockScreenshots);
  const backgroundedAt = useRef<number | null>(null);

  // Auto-bloqueo por inactividad.
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      const { autoLockMinutes } = usePreferences.getState();
      const session = useSession.getState();

      if (next === 'background' || next === 'inactive') {
        backgroundedAt.current = Date.now();
        if (autoLockMinutes === 0 && session.unlocked) session.lock();
        return;
      }

      if (next === 'active' && backgroundedAt.current != null) {
        const elapsedMin = (Date.now() - backgroundedAt.current) / 60000;
        backgroundedAt.current = null;
        if (session.unlocked && elapsedMin >= autoLockMinutes) {
          session.lock();
        } else if (useSession.getState().unlocked) {
          // Sigue desbloqueada al volver: intentamos sincronizar (sube pendientes
          // y baja cambios remotos) ahora que probablemente hay conexión.
          void useVaults.getState().sync();
        }
      }
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  // Bloqueo de capturas de pantalla.
  useEffect(() => {
    if (blockScreenshots) {
      ScreenCapture.preventScreenCaptureAsync().catch(() => {});
    } else {
      ScreenCapture.allowScreenCaptureAsync().catch(() => {});
    }
  }, [blockScreenshots]);

  return null;
}
