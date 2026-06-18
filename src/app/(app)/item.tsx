import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { PlatformIcon } from '@/components/PlatformIcon';
import { StrengthMeter } from '@/components/StrengthMeter';
import { useVaults } from '@/store/vaults';
import { CLIPBOARD_CLEAR_SECONDS, copyWithAutoClear } from '@/lib/clipboard';

/** "hace 3 días", "hace 2 h"… a partir de un timestamp en ms. */
function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'hace un momento';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'hace 1 día';
  if (d < 30) return `hace ${d} días`;
  const mo = Math.floor(d / 30);
  return `hace ${mo} ${mo === 1 ? 'mes' : 'meses'}`;
}

export default function ItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useVaults((s) => s.items.find((it) => it.id === id));
  const vault = useVaults((s) => s.vaults.find((v) => v.id === item?.vaultId));
  const deleteItem = useVaults((s) => s.deleteItem);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!item) return <Redirect href="/vaults" />;

  const copy = async (value: string, field: string) => {
    if (!value) return;
    await copyWithAutoClear(value);
    setCopied(field);
    setTimeout(() => setCopied((c) => (c === field ? null : c)), 1500);
  };

  const openUrl = () => {
    const href = item.url.startsWith('http') ? item.url : `https://${item.url}`;
    Linking.openURL(href).catch(() => Alert.alert('Error', 'No se pudo abrir el enlace.'));
  };

  const onDelete = () => {
    Alert.alert('Eliminar entrada', '¿Seguro que querés eliminar esta entrada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);
  };

  const copyIcon = (field: string) => (copied === field ? 'checkmark' : 'copy-outline');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {vault?.name ? `${vault.name} · ` : ''}Open Password
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar entrada"
          onPress={() => router.push({ pathname: '/item-form', params: { id: item.id } })}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name="create-outline" size={20} color={Colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <PlatformIcon platform={item.platform} title={item.title} size={88} fallbackColor={vault?.color} />
          <Text style={styles.title}>{item.title || 'Sin título'}</Text>
          {item.url ? (
            <Pressable onPress={openUrl}>
              <Text style={styles.domain}>{item.url}</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.card}>
          {item.username ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>USUARIO</Text>
              <View style={styles.fieldRow}>
                <Text style={styles.username} numberOfLines={1} selectable>
                  {item.username}
                </Text>
                <Pressable onPress={() => copy(item.username, 'user')} hitSlop={8}>
                  <Ionicons name={copyIcon('user')} size={20} color={Colors.accent} />
                </Pressable>
              </View>
            </View>
          ) : null}

          <View style={[styles.field, item.username ? styles.fieldDivider : null]}>
            <Text style={styles.fieldLabel}>CONTRASEÑA</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.password} numberOfLines={1} selectable={showPassword}>
                {showPassword ? item.password : '•'.repeat(Math.min(item.password.length || 10, 16))}
              </Text>
              <View style={styles.pwActions}>
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </Pressable>
                <Pressable onPress={() => copy(item.password, 'pass')} hitSlop={8}>
                  <Ionicons name={copyIcon('pass')} size={20} color={Colors.accent} />
                </Pressable>
              </View>
            </View>
            {item.password ? <StrengthMeter password={item.password} /> : null}
          </View>
        </View>

        {item.notes ? (
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NOTAS</Text>
              <Text style={styles.notes}>{item.notes}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.meta}>
          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.metaText}>
            Modificado {timeAgo(item.updatedAt)} · auto-borra copia en {CLIPBOARD_CLEAR_SECONDS}s
          </Text>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/item-form', params: { id: item.id } })}
          style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}
        >
          <Text style={styles.editText}>Editar</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Eliminar entrada"
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.danger} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
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
  topTitle: { flex: 1, color: Colors.textMuted, fontSize: 15, fontWeight: '600', textAlign: 'center' },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 12 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginTop: 6 },
  domain: { color: Colors.textMuted, fontSize: 15 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 18,
  },
  field: { paddingVertical: 16, gap: 10 },
  fieldDivider: { borderTopWidth: 1, borderTopColor: Colors.border },
  fieldLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  username: { color: Colors.accent, fontSize: 16, flex: 1 },
  password: { color: Colors.text, fontSize: 18, fontFamily: 'monospace', letterSpacing: 2, flex: 1 },
  pwActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  notes: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  metaText: { color: Colors.textMuted, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  editBtn: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    width: 64,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.danger + '55',
    backgroundColor: Colors.danger + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
