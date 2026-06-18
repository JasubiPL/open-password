import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const REPO_URL = 'https://github.com/JasubiPL/open-password';

export default function About() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>Acerca de</Text>
        <View style={styles.tile} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('@/assets/branding/logo-horizontal.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.tagline}>
          Gestor de contraseñas cero-conocimiento. Tus datos se cifran en tu dispositivo; el
          servidor solo guarda texto cifrado.
        </Text>

        <View style={styles.card}>
          <Row label="Versión" value="1.0" />
          <Row label="Cifrado" value="AES-256-GCM · Argon2id" divider />
          <Row label="Licencia" value="MIT" divider />
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(REPO_URL).catch(() => {})}
          style={({ pressed }) => [styles.repoBtn, pressed && styles.pressed]}
        >
          <Ionicons name="logo-github" size={20} color={Colors.text} />
          <Text style={styles.repoText}>Ver código fuente</Text>
          <Ionicons name="open-outline" size={18} color={Colors.textMuted} />
        </Pressable>

        <View style={styles.authorship}>
          <Image
            source={require('@/assets/branding/jasubip-horizontal.png')}
            style={styles.authorLogo}
            contentFit="contain"
          />
          <Text style={styles.legend}>
            JasubiP® — Marca registrada 2015–2026.{'\n'}Todos los derechos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  topTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 24, gap: 20, alignItems: 'center' },
  logo: { width: 220, height: 64, marginTop: 8 },
  tagline: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { alignSelf: 'stretch', backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowLabel: { color: Colors.textMuted, fontSize: 15 },
  rowValue: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  repoBtn: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  repoText: { flex: 1, color: Colors.text, fontSize: 16, fontWeight: '600' },
  authorship: { alignItems: 'center', gap: 12, marginTop: 8 },
  authorLogo: { width: 140, height: 40, opacity: 0.9 },
  legend: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
