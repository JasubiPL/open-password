import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { PlatformIcon } from '@/components/PlatformIcon';
import { copyWithAutoClear } from '@/lib/clipboard';
import { useVaults, type VaultItem } from '@/store/vaults';

const ALL = 'Todos';

export default function VaultDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vault = useVaults((s) => s.vaults.find((v) => v.id === id));
  const items = useVaults((s) => s.items);
  const deleteVault = useVaults((s) => s.deleteVault);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const all = useMemo(() => items.filter((it) => it.vaultId === id), [items, id]);

  // Categorías presentes en la bóveda (para los chips de filtro).
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of all) if (it.category?.trim()) set.add(it.category.trim());
    return [ALL, ...[...set].sort()];
  }, [all]);

  const vaultItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((it) => {
      if (category !== ALL && it.category?.trim() !== category) return false;
      if (!q) return true;
      return [it.title, it.username, it.url].some((f) => f?.toLowerCase().includes(q));
    });
  }, [all, query, category]);

  // La bóveda pudo eliminarse (p. ej. desde el form): volvemos a la lista.
  if (!vault) return <Redirect href="/vaults" />;

  const onCopy = async (item: VaultItem) => {
    if (!item.password) return;
    await copyWithAutoClear(item.password);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1500);
  };

  const onMenu = () => {
    Alert.alert(vault.name, undefined, [
      { text: 'Editar bóveda', onPress: () => router.push({ pathname: '/vault-form', params: { id: vault.id } }) },
      {
        text: 'Eliminar bóveda',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Eliminar bóveda', 'Se eliminará la bóveda y sus entradas. ¿Continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: async () => {
                await deleteVault(vault.id);
                router.back();
              },
            },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const renderItem = ({ item }: { item: VaultItem }) => (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push({ pathname: '/item', params: { id: item.id } })}
    >
      <PlatformIcon platform={item.platform} title={item.title} size={44} fallbackColor={vault.color} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title || 'Sin título'}
        </Text>
        {item.username ? (
          <Text style={styles.rowSub} numberOfLines={1}>
            {item.username}
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityLabel="Copiar contraseña"
        onPress={() => onCopy(item)}
        hitSlop={10}
        style={({ pressed }) => [styles.copyBtn, pressed && styles.rowPressed]}
      >
        <Ionicons name={copiedId === item.id ? 'checkmark' : 'copy-outline'} size={20} color={Colors.accent} />
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Opciones de la bóveda"
          onPress={onMenu}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <View style={[styles.iconTile, { backgroundColor: vault.color + '26' }]}>
          <Ionicons name={vault.icon as keyof typeof Ionicons.glyphMap} size={26} color={vault.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            {vault.name}
          </Text>
          <Text style={styles.count}>
            {all.length} {all.length === 1 ? 'entrada' : 'entradas'}
          </Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Buscar en ${vault.name}`}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {categories.length > 1 ? (
        <View style={styles.chipsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((c) => {
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      <FlatList
        data={vaultItems}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{query || category !== ALL ? 'Sin resultados.' : 'Aún no hay entradas.'}</Text>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nueva entrada"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push({ pathname: '/item-form', params: { vaultId: vault.id } })}
      >
        <Ionicons name="add" size={30} color={Colors.background} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  iconTile: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '700' },
  count: { color: Colors.textMuted, fontSize: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 13 },
  chipsWrap: { marginTop: 14 },
  chips: { paddingHorizontal: 20, gap: 10 },
  chip: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: Colors.background },
  list: { padding: 16, paddingTop: 14, paddingBottom: 110, gap: 10, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
  },
  rowPressed: { opacity: 0.7 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  rowSub: { color: Colors.accent, fontSize: 13 },
  copyBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPressed: { opacity: 0.85 },
});
