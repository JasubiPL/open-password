import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/store/session';

/**
 * Área autenticada. Guard: requiere sesión y bóveda desbloqueada;
 * si falta una, redirige al flujo correspondiente.
 */
export default function AppLayout() {
  const status = useSession((s) => s.status);
  const unlocked = useSession((s) => s.unlocked);

  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/onboarding" />;
  if (!unlocked) return <Redirect href="/unlock" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
