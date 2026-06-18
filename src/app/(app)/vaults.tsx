import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useSession } from '@/store/session';
import { useVaults, type Vault } from '@/store/vaults';

export default function Vaults() {
  const router = useRouter();
  const lock = useSession((s) => s.lock);
  const vaults = useVaults((s) => s.vaults);
  const items = useVaults((s) => s.items);

  const countFor = (vaultId: string) => items.filter((it) => it.vaultId === vaultId).length;

  const renderVault = ({ item: vault }: { item: Vault }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: '/vault', params: { id: vault.id } })}
    >
      <View style={[styles.iconBadge, { backgroundColor: vault.color + '22' }]}>
        <Ionicons name={vault.icon as keyof typeof Ionicons.glyphMap} size={24} color={vault.color} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{vault.name}</Text>
        <Text style={styles.cardCount}>
          {countFor(vault.id)} {countFor(vault.id) === 1 ? 'entrada' : 'entradas'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Bóvedas</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Bloquear" onPress={lock} hitSlop={10}>
          <Ionicons name="lock-closed-outline" size={22} color={Colors.textMuted} />
        </Pressable>
      </View>

      <FlatList
        data={vaults}
        keyExtractor={(v) => v.id}
        renderItem={renderVault}
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
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 10, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
  },
  cardPressed: { opacity: 0.8 },
  iconBadge: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  cardCount: { color: Colors.textMuted, fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700' },
  emptyBody: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
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
