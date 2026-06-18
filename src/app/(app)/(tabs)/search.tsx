import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlatformIcon } from '@/components/PlatformIcon';
import { Colors } from '@/constants/theme';
import { useVaults, type VaultItem } from '@/store/vaults';

export default function Search() {
  const router = useRouter();
  const items = useVaults((s) => s.items);
  const vaults = useVaults((s) => s.vaults);
  const [query, setQuery] = useState('');

  const vaultName = useMemo(() => {
    const map = new Map(vaults.map((v) => [v.id, v.name]));
    return (id: string) => map.get(id) ?? '';
  }, [vaults]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items.filter((it) =>
      [it.title, it.username, it.url, it.notes].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const renderItem = ({ item }: { item: VaultItem }) => (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: '/item', params: { id: item.id } })}
    >
      <PlatformIcon platform={item.platform} title={item.title} size={42} />
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.username || vaultName(item.vaultId)}
        </Text>
      </View>
      <Text style={styles.rowVault} numberOfLines={1}>
        {vaultName(item.vaultId)}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en todas las bóvedas"
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={results}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name={query ? 'search-outline' : 'documents-outline'}
              size={44}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyText}>
              {query ? 'Sin resultados' : 'Buscá entre todas tus entradas'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 24, paddingTop: 8 },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { flex: 1, color: Colors.text, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8, flexGrow: 1 },
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
  pressed: { opacity: 0.8 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  rowSub: { color: Colors.textMuted, fontSize: 13 },
  rowVault: { color: Colors.textMuted, fontSize: 12, maxWidth: 90 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
