import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Firma discreta de autoría. Se usa en Login, Desbloqueo y el pie de Ajustes.
 * Ver docs/design/screens.md → "Marca y atribución".
 */
export function BrandSignature({ style }: { style?: object }) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.text}>JasubiP® 2015–2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 8 },
  text: { color: Colors.textMuted, fontSize: 12, letterSpacing: 0.5 },
});
