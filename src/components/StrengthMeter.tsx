import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { estimateStrength } from '@/lib/passwordStrength';

const LABELS = { weak: 'Débil', medium: 'Media', strong: 'Fuerte' } as const;
const COLORS = { weak: Colors.danger, medium: Colors.warning, strong: Colors.success } as const;

export function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, level } = estimateStrength(password);
  const filled = Math.max(1, score);
  return (
    <View style={styles.wrapper}>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.bar, { backgroundColor: i < filled ? COLORS[level] : Colors.border }]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: COLORS[level] }]}>{LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bars: { flexDirection: 'row', gap: 4, flex: 1 },
  bar: { flex: 1, height: 5, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '700', width: 48, textAlign: 'right' },
});
