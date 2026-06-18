import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { PlatformIcon } from '@/components/PlatformIcon';
import { useVaults, type VaultItem } from '@/store/vaults';

export default function VaultDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vault = useVaults((s) => s.vaults.find((v) => v.id === id));
  const items = useVaults((s) => s.items);
  const [query, setQuery] = useState('');

  const vaultItems = useMemo(() => {
    const list = items.filter((it) => it.vaultId === id);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.username.toLowerCase().includes(q) ||
        it.url.toLowerCase().includes(q),
    );
  }, [items, id, query]);

  // La bóveda pudo eliminarse (p. ej. desde el form): volvemos a la lista.
  if (!vault) return <Redirect href="/vaults" />;

  const renderItem = ({ item }: { item: VaultItem }) => (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push({ pathname: '/item', params: { id: item.id } })}
    >
      <PlatformIcon platform={item.platform} title={item.title} size={40} fallbackColor={vault.color} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{item.title || 'Sin título'}</Text>
        {item.username ? <Text style={styles.rowSub}>{item.username}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </Pressable>
        <View style={styles.titleRow}>
          <Ionicons name={vault.icon as keyof typeof Ionicons.glyphMap} size={20} color={vault.color} />
          <Text style={styles.topTitle} numberOfLines={1}>
            {vault.name}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar bóveda"
          onPress={() => router.push({ pathname: '/vault-form', params: { id: vault.id } })}
          hitSlop={10}
        >
          <Ionicons name="create-outline" size={22} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en la bóveda"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={vaultItems}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{query ? 'Sin resultados.' : 'Aún no hay entradas.'}</Text>
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
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 10 },
  titleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  topTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', flexShrink: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 12 },
  list: { padding: 16, paddingBottom: 100, gap: 8, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  rowPressed: { opacity: 0.8 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowInitial: { fontSize: 18, fontWeight: '700' },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  rowSub: { color: Colors.textMuted, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPressed: { opacity: 0.85 },
});
