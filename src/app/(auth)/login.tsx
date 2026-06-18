import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { BrandSignature } from '@/components/BrandSignature';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';

export default function Login() {
  const router = useRouter();
  const loginUser = useSession((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailOk && password.length > 0 && !loading;

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      router.replace('/vaults');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay visible={loading} message="Iniciando sesión…" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Accedé a tu bóveda en este dispositivo.</Text>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextField
            label="Contraseña maestra"
            value={password}
            onChangeText={setPassword}
            placeholder="Tu contraseña maestra"
            secure
            textContentType="password"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Entrar" onPress={onSubmit} disabled={!canSubmit} loading={loading} />

          <Link href="/register" asChild>
            <Pressable accessibilityRole="button" style={styles.linkWrap}>
              <Text style={styles.link}>¿Crear cuenta?</Text>
            </Pressable>
          </Link>

          <BrandSignature style={styles.signature} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  content: { padding: 24, gap: 16 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 14 },
  error: { color: Colors.danger, fontSize: 13 },
  linkWrap: { alignItems: 'center', paddingVertical: 12 },
  link: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  signature: { marginTop: 24 },
});
