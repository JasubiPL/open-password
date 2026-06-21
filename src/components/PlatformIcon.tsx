import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { getPlatform } from '@/constants/platforms';
import { LOGO_COVER, LOGO_FILL, RASTER_LOGOS, SVG_LOGOS } from '@/constants/platformLogos';

/** Luminancia relativa aproximada (0..1) de un color hex. */
function luminance(hex: string): number {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tinta para el glifo sobre tile BLANCO: el color de marca, u oscuro si es muy claro. */
function inkOnWhite(color: string): string {
  return luminance(color) > 0.72 ? '#15191F' : color;
}

/**
 * Icono para una entrada:
 *  - Marca conocida → logo (FontAwesome6) sobre **tile blanco** en color de marca,
 *    como en el handoff de diseño (tinta oscura para marcas casi blancas).
 *  - Categoría genérica → glifo (Ionicons) sobre tile tintado.
 *  - Desconocida → inicial del título sobre tile tintado; o un candado.
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
  const radius = size * 0.27;

  if (known?.iconSet === 'logo') {
    const Logo = SVG_LOGOS[known.icon];
    const raster = RASTER_LOGOS[known.icon];
    // Logos que ya traen fondo: se dibujan a sangre sobre un tile de su mismo color.
    const fillBg = LOGO_FILL[known.icon];
    const cover = !!LOGO_COVER[known.icon];
    const logoSize = fillBg ? size : Math.round(size * 0.62);
    return (
      <View
        style={[
          styles.badge,
          { width: size, height: size, borderRadius: radius, overflow: 'hidden', backgroundColor: fillBg ?? '#FFFFFF' },
        ]}
      >
        {Logo ? (
          <Logo width={logoSize} height={logoSize} preserveAspectRatio={cover ? 'xMidYMid slice' : undefined} />
        ) : raster ? (
          <Image source={raster} style={{ width: logoSize, height: logoSize }} contentFit={fillBg ? 'cover' : 'contain'} />
        ) : (
          <Text style={[styles.initial, { fontSize: iconSize, color: known.color }]}>{known.name.charAt(0)}</Text>
        )}
      </View>
    );
  }

  if (known?.kind === 'brand' && known.iconSet === 'fa6') {
    return (
      <View style={[styles.badge, styles.brandTile, { width: size, height: size, borderRadius: radius }]}>
        <FontAwesome6
          name={known.icon as keyof typeof FontAwesome6.glyphMap}
          size={iconSize}
          color={inkOnWhite(known.color)}
        />
      </View>
    );
  }

  const tint = known?.color ?? fallbackColor;
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: radius, backgroundColor: tint + '22' }]}>
      {known?.iconSet === 'ion' ? (
        <Ionicons name={known.icon as keyof typeof Ionicons.glyphMap} size={iconSize} color={tint} />
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
  brandTile: { backgroundColor: '#FFFFFF' },
  initial: { fontWeight: '700' },
});
