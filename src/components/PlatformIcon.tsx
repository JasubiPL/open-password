import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { getPlatform } from '@/constants/platforms';

/**
 * Icono para una entrada: logo de marca a color si la plataforma está en el
 * catálogo; si no, la inicial del título sobre un badge con `fallbackColor`.
 */
export function PlatformIcon({
  platform,
  title,
  size = 40,
  fallbackColor = Colors.accent,
}: {
  platform?: string;
  title?: string;
  size?: number;
  fallbackColor?: string;
}) {
  const known = getPlatform(platform);
  const iconSize = Math.round(size * 0.52);
  const tint = known?.color ?? fallbackColor;

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.27, backgroundColor: tint + '22' }]}>
      {known ? (
        <FontAwesome6 name={known.icon as keyof typeof FontAwesome6.glyphMap} size={iconSize} color={tint} />
      ) : title ? (
        <Text style={[styles.initial, { fontSize: iconSize, color: tint }]}>{title.charAt(0).toUpperCase()}</Text>
      ) : (
        <Ionicons name="key" size={iconSize} color={tint} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
  initial: { fontWeight: '700' },
});
