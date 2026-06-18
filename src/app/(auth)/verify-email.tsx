import { useState } from 'react';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { resendConfirmationEmail } from '@/lib/auth';

/**
 * Pantalla que se muestra tras el registro cuando el proyecto exige confirmar el
 * email. La cuenta ya existe (salt + Vault Key cifrada guardados en
 * user_metadata); al confirmar e iniciar sesión, el perfil se materializa.
 */
export default function VerifyEmail() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const onResend = async () => {
    if (!email) return;
    setNotice(null);
    setResending(true);
    try {
      await resendConfirmationEmail(email);
      setNotice('Te reenviamos el correo de confirmación.');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'No se pudo reenviar el correo.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/branding/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Confirmá tu email</Text>
        <Text style={styles.body}>
          Te enviamos un enlace de confirmación{email ? ' a ' : ''}
          {email ? <Text style={styles.email}>{email}</Text> : ''}. Abrilo para activar tu
          cuenta y luego iniciá sesión para terminar de crear tu bóveda.
        </Text>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.actions}>
          <Button label="Ya confirmé, iniciar sesión" onPress={() => router.replace('/login')} />
          <Button
            label="Reenviar correo"
            variant="ghost"
            onPress={onResend}
            loading={resending}
            disabled={!email}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/onboarding')}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.footer}>JasubiP® 2015–2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 },
  logo: { width: 88, height: 88, alignSelf: 'center', marginBottom: 8 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', textAlign: 'center' },
  body: { color: Colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  email: { color: Colors.text, fontWeight: '600' },
  notice: { color: Colors.accent, fontSize: 13, textAlign: 'center' },
  actions: { gap: 8, marginTop: 12 },
  linkWrap: { alignItems: 'center', paddingVertical: 12 },
  link: { color: Colors.textMuted, fontSize: 14 },
  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingBottom: 12 },
});
