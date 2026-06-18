import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { SecurityGuards } from '@/components/SecurityGuards';
import { useSession } from '@/store/session';
import { usePreferences } from '@/store/preferences';

export default function RootLayout() {
  const bootstrap = useSession((s) => s.bootstrap);
  const loadPrefs = usePreferences((s) => s.load);

  useEffect(() => {
    void loadPrefs();
    let unsubscribe: (() => void) | undefined;
    bootstrap().then((fn) => {
      unsubscribe = fn;
    });
    return () => unsubscribe?.();
  }, [bootstrap, loadPrefs]);

  return (
    <>
      <StatusBar style="light" />
      <SecurityGuards />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          contentStyle: { backgroundColor: Colors.background },
          headerShown: false,
        }}
      />
    </>
  );
}
