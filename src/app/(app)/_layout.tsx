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

  useEffect(() => {
    if (status === 'signedIn' && unlocked && !loaded) {
      initDatabase().then(load).catch(() => {});
    }
  }, [status, unlocked, loaded, load]);

  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/onboarding" />;
  if (!unlocked) return <Redirect href="/unlock" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
