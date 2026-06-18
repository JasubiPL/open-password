import { useEffect } from 'react';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/store/session';
import { useVaults } from '@/store/vaults';
import { initDatabase } from '@/db/database';

/**
 * Área autenticada. Guard: requiere sesión y bóveda desbloqueada.
 * Al entrar, inicializa el cache local y carga las bóvedas/items descifrados.
 */
export default function AppLayout() {
  const status = useSession((s) => s.status);
  const unlocked = useSession((s) => s.unlocked);
  const loaded = useVaults((s) => s.loaded);
  const load = useVaults((s) => s.load);
  const sync = useVaults((s) => s.sync);

  useEffect(() => {
    if (status === 'signedIn' && unlocked && !loaded) {
      // Carga local primero (instantáneo, offline), luego sincroniza con el
      // servidor en segundo plano (push de pendientes + pull de remotos).
      initDatabase()
        .then(load)
        .then(() => sync())
        .catch(() => {});
    }
  }, [status, unlocked, loaded, load, sync]);

  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/onboarding" />;
  if (!unlocked) return <Redirect href="/unlock" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
