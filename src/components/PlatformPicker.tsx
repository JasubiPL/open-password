import { useMemo, useState } from 'react';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BRANDS, CATEGORIES, type Platform } from '@/constants/platforms';

/**
 * Selector de plataforma. Permite buscar y elegir una app (logo de marca), una
 * categoría genérica (banco, telecom…), o marcar "Personalizada" (sin plataforma).
 * Se abre/cierra en la misma pantalla (no navega), así que el Modal es seguro aquí.
 */
export function PlatformPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (platform: Platform | null) => void;
}) {
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (p: Platform) => !q || p.name.toLowerCase().includes(q);
    const apps = BRANDS.filter(match);
    const cats = CATEGORIES.filter(match);
    return [
      ...(apps.length ? [{ title: 'Apps', data: apps }] : []),
      ...(cats.length ? [{ title: 'Categorías', data: cats }] : []),
    ];
  }, [query]);

  const choose = (platform: Platform | null) => {
    setQuery('');
    onSelect(platform);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Elegir plataforma</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar (Google, Banco, Telecom…)"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => choose(null)}>
              <View style={[styles.iconBadge, { backgroundColor: Colors.surfaceAlt }]}>
                <Ionicons name="create-outline" size={20} color={Colors.textMuted} />
              </View>
              <Text style={styles.rowText}>Personalizada (no está en la lista)</Text>
            </Pressable>
          }
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          renderItem={({ item }) => (
            <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={() => choose(item)}>
              <View style={[styles.iconBadge, { backgroundColor: item.color + '22' }]}>
                {item.iconSet === 'fa6' ? (
                  <FontAwesome6 name={item.icon as keyof typeof FontAwesome6.glyphMap} size={20} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={item.color} />
                )}
              </View>
              <Text style={styles.rowText}>{item.name}</Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
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
  list: { padding: 16, paddingBottom: 32 },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowPressed: { backgroundColor: Colors.surface },
  iconBadge: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { color: Colors.text, fontSize: 16 },
});
