import { Redirect } from 'expo-router';
import { Splash } from '@/components/Splash';
import { useSession } from '@/store/session';

/** Punto de arranque: decide a dónde ir según la sesión y el estado de bloqueo. */
export default function Index() {
  const status = useSession((s) => s.status);
  const unlocked = useSession((s) => s.unlocked);

  if (status === 'loading') return <Splash />;
  if (status === 'signedOut') return <Redirect href="/onboarding" />;
  if (!unlocked) return <Redirect href="/unlock" />;
  return <Redirect href="/vaults" />;
}
