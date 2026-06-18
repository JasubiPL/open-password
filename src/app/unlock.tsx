import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';
import { isBiometricAvailable, unlockWithBiometrics } from '@/lib/biometric';

/** Enmascara el email: j***@dominio.com */
function maskEmail(email: string | null): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user[0]}${'*'.repeat(Math.max(1, user.length - 1))}@${domain}`;
}

export default function Unlock() {
  const router = useRouter();
  const email = useSession((s) => s.email);
  const unlockVault = useSession((s) => s.unlock);
  const syncUnlocked = useSession((s) => s.syncUnlocked);
  const logout = useSession((s) => s.logout);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricEnabled);
  }, []);

  const onUnlock = async () => {
    setError(null);
    setLoading(true);
    try {
      await unlockVault(password);
      router.replace('/vaults');
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const onBiometric = async () => {
    setError(null);
    try {
      const ok = await unlockWithBiometrics();
      if (ok) {
        syncUnlocked();
        router.replace('/vaults');
      }
    } catch {
      setError('No se pudo desbloquear con biometría.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay visible={loading} message="Desbloqueando…" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Image
            source={require('@/assets/branding/splash-icon.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Desbloqueá tu bóveda</Text>
          {email ? <Text style={styles.email}>{maskEmail(email)}</Text> : null}

          <TextField
            label="Contraseña maestra"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña maestra"
            secure
            textContentType="password"
            onSubmitEditing={onUnlock}
            returnKeyType="go"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Desbloquear"
            onPress={onUnlock}
            disabled={password.length === 0 || loading}
            loading={loading}
          />

          {biometricEnabled ? (
            <Button label="Usar biometría" variant="ghost" onPress={onBiometric} />
          ) : null}
        </View>

        <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutWrap}>
          <Text style={styles.logout}>Usar otra cuenta / Cerrar sesión</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  logo: { width: 88, height: 88, alignSelf: 'center', marginBottom: 8 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  email: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  error: { color: Colors.danger, fontSize: 13 },
  logoutWrap: { alignItems: 'center', paddingVertical: 16 },
  logout: { color: Colors.textMuted, fontSize: 14 },
});
