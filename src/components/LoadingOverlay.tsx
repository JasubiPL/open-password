import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Overlay modal a pantalla completa para operaciones que bloquean el hilo de JS
 * (p. ej. derivación Argon2id). El `ActivityIndicator` se anima en el hilo
 * nativo, así que sigue girando aunque JS esté ocupado; el modal además impide
 * que el usuario toque la UI muerta durante el cálculo.
 */
export function LoadingOverlay({ visible, message }: { visible: boolean; message: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(14,17,22,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
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
