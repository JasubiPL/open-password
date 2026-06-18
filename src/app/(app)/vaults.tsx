import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';

/**
 * Placeholder de la pantalla principal de bóvedas. El CRUD real llega en la
 * Fase 3; por ahora confirma que el flujo de auth/desbloqueo funciona.
 */
export default function Vaults() {
  const email = useSession((s) => s.email);
  const lock = useSession((s) => s.lock);
  const logout = useSession((s) => s.logout);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Bóvedas</Text>
        <Text style={styles.subtitle}>Bóveda desbloqueada{email ? ` · ${email}` : ''}.</Text>
        <Text style={styles.note}>Las bóvedas y entradas llegan en la Fase 3.</Text>

        <View style={styles.actions}>
          <Button label="Bloquear" variant="ghost" onPress={lock} />
          <Button label="Cerrar sesión" variant="ghost" onPress={logout} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 24, gap: 10, justifyContent: 'center' },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: Colors.text, fontSize: 15 },
  note: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
  actions: { gap: 8 },
});
