import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';
import { useVaults, type Vault } from '@/store/vaults';

export default function Vaults() {
  const router = useRouter();
  const email = useSession((s) => s.email);
  const vaults = useVaults((s) => s.vaults);
  const items = useVaults((s) => s.items);

  const countFor = (vaultId: string) => items.filter((it) => it.vaultId === vaultId).length;
  const initial = (email?.[0] ?? '?').toUpperCase();

  const renderVault = ({ item: vault }: { item: Vault }) => {
    const n = countFor(vault.id);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push({ pathname: '/vault', params: { id: vault.id } })}
      >
        <View style={[styles.iconTile, { backgroundColor: vault.color + '26' }]}>
          <Ionicons name={vault.icon as keyof typeof Ionicons.glyphMap} size={22} color={vault.color} />
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {vault.name}
        </Text>
        <Text style={styles.cardCount}>
          {n} {n === 1 ? 'entrada' : 'entradas'}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Bóvedas</Text>
          <Text style={styles.subtitle}>
            {vaults.length} {vaults.length === 1 ? 'bóveda' : 'bóvedas'} · {items.length}{' '}
            {items.length === 1 ? 'entrada' : 'entradas'} · sync
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cuenta y ajustes"
          onPress={() => router.push('/settings')}
          style={styles.avatar}
          hitSlop={8}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.searchBar}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <Text style={styles.searchText}>Buscar en todas las bóvedas</Text>
      </Pressable>

      <FlatList
        data={vaults}
        keyExtractor={(v) => v.id}
        renderItem={renderVault}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Creá tu primera bóveda</Text>
            <Text style={styles.emptyBody}>Organizá tus credenciales en compartimentos.</Text>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Nueva bóveda"
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/vault-form')}
      >
        <Ionicons name="add" size={30} color={Colors.background} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerText: { flex: 1, gap: 2 },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 13 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.accent, fontSize: 16, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 16,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchText: { color: Colors.textMuted, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 120, gap: 14, flexGrow: 1 },
  row: { gap: 14 },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    minHeight: 120,
    justifyContent: 'flex-start',
  },
  cardPressed: { opacity: 0.8 },
  iconTile: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginTop: 4 },
  cardCount: { color: Colors.textMuted, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
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
