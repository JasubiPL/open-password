import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { StrengthMeter } from '@/components/StrengthMeter';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';
import { isAcceptableMasterPassword, MIN_MASTER_PASSWORD_LENGTH } from '@/lib/passwordStrength';

export default function Register() {
  const router = useRouter();
  const registerUser = useSession((s) => s.register);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const passwordOk = isAcceptableMasterPassword(password);
  const matches = password.length > 0 && password === confirm;
  const canSubmit = emailOk && passwordOk && matches && accepted && !loading;

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await registerUser(email, password);
      if (result === 'emailConfirmationRequired') {
        router.replace({ pathname: '/verify-email', params: { email: email.trim().toLowerCase() } });
      } else {
        router.replace('/vaults');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LoadingOverlay visible={loading} message="Creando tu bóveda…" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Crear bóveda</Text>
          <Text style={styles.subtitle}>
            Tu contraseña maestra es la llave de todo. Elegí una fuerte y memorable.
          </Text>

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            textContentType="emailAddress"
          />

          <View>
            <TextField
              label="Contraseña maestra"
              value={password}
              onChangeText={setPassword}
              placeholder={`Mínimo ${MIN_MASTER_PASSWORD_LENGTH} caracteres`}
              secure
              textContentType="newPassword"
            />
            <View style={styles.meter}>
              <StrengthMeter password={password} />
            </View>
          </View>

          <TextField
            label="Confirmar contraseña"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repetí la contraseña"
            secure
            error={confirm.length > 0 && !matches ? 'Las contraseñas no coinciden.' : null}
          />

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              Si olvidás tu contraseña maestra no hay forma de recuperarla. No la guardamos.
            </Text>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              onPress={() => setAccepted((a) => !a)}
              style={styles.checkboxRow}
            >
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.checkboxLabel}>Entiendo y acepto el riesgo.</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label="Crear bóveda" onPress={onSubmit} disabled={!canSubmit} loading={loading} />

          <Link href="/login" asChild>
            <Pressable accessibilityRole="button" style={styles.linkWrap}>
              <Text style={styles.link}>Ya tengo cuenta</Text>
            </Pressable>
          </Link>
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
  subtitle: { color: Colors.textMuted, fontSize: 14, lineHeight: 20 },
  meter: { marginTop: 8 },
  warning: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  warningText: { color: Colors.text, fontSize: 13, lineHeight: 19 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkmark: { color: Colors.background, fontSize: 14, fontWeight: '900' },
  checkboxLabel: { color: Colors.textMuted, fontSize: 13 },
  error: { color: Colors.danger, fontSize: 13 },
  linkWrap: { alignItems: 'center', paddingVertical: 12 },
  link: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
});
