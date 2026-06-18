import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { PlatformIcon } from '@/components/PlatformIcon';
import { useVaults } from '@/store/vaults';
import { CLIPBOARD_CLEAR_SECONDS, copyWithAutoClear } from '@/lib/clipboard';

function Field({
  label,
  value,
  onCopy,
  masked,
  onToggleMask,
  onOpen,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  masked?: boolean;
  onToggleMask?: () => void;
  onOpen?: () => void;
}) {
  if (!value) return null;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <Text style={styles.fieldValue} numberOfLines={masked ? 1 : undefined}>
          {masked ? '••••••••••' : value}
        </Text>
        <View style={styles.fieldActions}>
          {onToggleMask ? (
            <Pressable accessibilityRole="button" onPress={onToggleMask} hitSlop={8}>
              <Ionicons name={masked ? 'eye-outline' : 'eye-off-outline'} size={20} color={Colors.textMuted} />
            </Pressable>
          ) : null}
          {onOpen ? (
            <Pressable accessibilityRole="button" onPress={onOpen} hitSlop={8}>
              <Ionicons name="open-outline" size={20} color={Colors.textMuted} />
            </Pressable>
          ) : null}
          {onCopy ? (
            <Pressable accessibilityRole="button" onPress={onCopy} hitSlop={8}>
              <Ionicons name="copy-outline" size={20} color={Colors.accent} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useVaults((s) => s.items.find((it) => it.id === id));
  const deleteItem = useVaults((s) => s.deleteItem);
  const [showPassword, setShowPassword] = useState(false);

  if (!item) return <Redirect href="/vaults" />;

  const copy = async (value: string, label: string) => {
    await copyWithAutoClear(value);
    Alert.alert('Copiado', `${label} copiado. Se borra en ${CLIPBOARD_CLEAR_SECONDS}s.`);
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar entrada"
          onPress={() => router.push({ pathname: '/item-form', params: { id: item.id } })}
          hitSlop={10}
        >
          <Ionicons name="create-outline" size={22} color={Colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <PlatformIcon platform={item.platform} title={item.title} size={52} />
          <View style={styles.titleText}>
            <Text style={styles.title}>{item.title || 'Sin título'}</Text>
            {item.category ? <Text style={styles.category}>{item.category}</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <Field label="Usuario / email" value={item.username} onCopy={() => copy(item.username, 'Usuario')} />
          <Field
            label="Contraseña"
            value={item.password}
            masked={!showPassword}
            onToggleMask={() => setShowPassword((s) => !s)}
            onCopy={() => copy(item.password, 'Contraseña')}
          />
          <Field label="Sitio / URL" value={item.url} onOpen={openUrl} onCopy={() => copy(item.url, 'URL')} />
          <Field label="Notas" value={item.notes} />
        </View>

        <Pressable accessibilityRole="button" onPress={onDelete} style={styles.deleteWrap}>
          <Text style={styles.deleteText}>Eliminar entrada</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  content: { padding: 24, gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  titleText: { flex: 1, gap: 2 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700' },
  category: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  field: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.border, gap: 6 },
  fieldLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  fieldValue: { color: Colors.text, fontSize: 16, flex: 1 },
  fieldActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  deleteWrap: { alignItems: 'center', paddingVertical: 20 },
  deleteText: { color: Colors.danger, fontSize: 15, fontWeight: '600' },
});
