import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';

export default function RootLayout() {
  const bootstrap = useSession((s) => s.bootstrap);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    bootstrap().then((fn) => {
      unsubscribe = fn;
    });
    return () => unsubscribe?.();
  }, [bootstrap]);

  return (
    <>
      <StatusBar style="light" />
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
