import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Overlay a pantalla completa para operaciones que bloquean el hilo de JS
 * (p. ej. derivación Argon2id). El `ActivityIndicator` se anima en el hilo
 * nativo, así que sigue girando aunque JS esté ocupado.
 *
 * Es un `View` absoluto (no un `Modal`): el `Modal` de RN puede quedarse trabado
 * si la pantalla navega/desmonta mientras está visible (causaba un cuelgue de la
 * UI tras crear la bóveda). Un View se desmonta limpio con la pantalla.
 */
export function LoadingOverlay({ visible, message }: { visible: boolean; message: string }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14,17,22,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
    gap: 14,
  },
  message: { color: Colors.text, fontSize: 15, fontWeight: '600' },
});
