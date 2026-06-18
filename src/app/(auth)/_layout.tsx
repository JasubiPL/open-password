import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/store/session';

/** Grupo de pantallas para usuarios sin sesión. Si ya hay sesión, salimos. */
export default function AuthLayout() {
  const status = useSession((s) => s.status);
  if (status === 'signedIn') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
