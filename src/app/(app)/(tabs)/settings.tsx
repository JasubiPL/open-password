import { useEffect, useState, type ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandSignature } from '@/components/BrandSignature';
import { Colors } from '@/constants/theme';
import { getVaultKey } from '@/crypto';
import { useSession } from '@/store/session';
import {
  disableBiometricUnlock,
  enableBiometricUnlock,
  isBiometricAvailable,
  isBiometricEnabled,
} from '@/lib/biometric';

const SOON = () => Alert.alert('Próximamente', 'Esta opción llega en la Fase 6 (pulido).');

export default function Settings() {
  const router = useRouter();
  const email = useSession((s) => s.email);
  const logout = useSession((s) => s.logout);
  const lock = useSession((s) => s.lock);

  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
    isBiometricEnabled().then(setBioEnabled);
  }, []);

  const initial = (email?.[0] ?? '?').toUpperCase();
  const name = email ? email.split('@')[0] : 'Mi cuenta';

  const onToggleBiometric = async (next: boolean) => {
    try {
      if (next) {
        await enableBiometricUnlock(getVaultKey());
      } else {
        await disableBiometricUnlock();
      }
      setBioEnabled(next);
    } catch {
      Alert.alert('Error', 'No se pudo cambiar el desbloqueo biométrico.');
    }
  };

  const onLogout = () => {
    Alert.alert('Cerrar sesión', 'Se borrará el cache local de este dispositivo. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.accountEmail} numberOfLines={1}>
              {email}
            </Text>
          </View>
          <View style={styles.syncRow}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Sync</Text>
          </View>
        </View>

        <Text style={styles.section}>SEGURIDAD</Text>
        <View style={styles.card}>
          <Row icon="finger-print" label="Desbloqueo biométrico">
            <Switch
              value={bioEnabled}
              disabled={!bioAvailable}
              onValueChange={onToggleBiometric}
              trackColor={{ false: Colors.surfaceAlt, true: Colors.accent }}
              thumbColor={Colors.text}
              ios_backgroundColor={Colors.surfaceAlt}
            />
          </Row>
          <Row icon="time-outline" label="Auto-bloqueo" onPress={SOON} divider>
            <Text style={styles.value}>1 min ›</Text>
          </Row>
          <Row icon="lock-closed-outline" label="Cambiar contraseña maestra" onPress={SOON} divider>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Row>
          <Row icon="phone-portrait-outline" label="Bloquear ahora" onPress={lock} divider>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Row>
        </View>

        <Text style={styles.section}>DATOS · APARIENCIA</Text>
        <View style={styles.card}>
          <Row icon="download-outline" label="Importar CSV" onPress={SOON}>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Row>
          <Row icon="contrast-outline" label="Tema" onPress={SOON} divider>
            <Text style={styles.value}>Oscuro ›</Text>
          </Row>
          <Row icon="information-circle-outline" label="Acerca de" onPress={() => router.push('/about')} divider>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Row>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.footer}>Open Password v1.0 · cero-conocimiento · MIT</Text>
        <BrandSignature />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  children,
  onPress,
  divider,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children?: ReactNode;
  onPress?: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, divider && styles.rowDivider, pressed && onPress && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={Colors.text} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 48, gap: 14 },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700', marginBottom: 4 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.background, fontSize: 22, fontWeight: '700' },
  accountInfo: { flex: 1, gap: 2 },
  accountName: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  accountEmail: { color: Colors.textMuted, fontSize: 13 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  syncText: { color: Colors.success, fontSize: 14, fontWeight: '600' },
  section: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginLeft: 4 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  rowDivider: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowIcon: { width: 24, textAlign: 'center' },
  rowLabel: { flex: 1, color: Colors.text, fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  value: { color: Colors.textMuted, fontSize: 15 },
  pressed: { opacity: 0.6 },
  logoutBtn: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.danger + '55',
    backgroundColor: Colors.danger + '14',
  },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: '700' },
  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
