import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Colors } from '@/constants/theme';
import { DEFAULT_VAULT_COLOR, DEFAULT_VAULT_ICON, VAULT_COLORS, VAULT_ICONS } from '@/constants/vaultOptions';
import { useVaults } from '@/store/vaults';

export default function VaultForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useVaults((s) => s.vaults.find((v) => v.id === id));
  const createVault = useVaults((s) => s.createVault);
  const updateVault = useVaults((s) => s.updateVault);
  const deleteVault = useVaults((s) => s.deleteVault);
  const isEditing = Boolean(existing);

  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? DEFAULT_VAULT_ICON);
  const [color, setColor] = useState(existing?.color ?? DEFAULT_VAULT_COLOR);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const onSave = async () => {
    setSaving(true);
    try {
      const input = { name: name.trim(), icon, color };
      if (existing) await updateVault(existing.id, input);
      else await createVault(input);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la bóveda.');
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert('Eliminar bóveda', 'Se eliminarán también todas sus entradas. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteVault(existing.id);
          router.dismissAll();
          router.replace('/vaults');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{isEditing ? 'Editar bóveda' : 'Nueva bóveda'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TextField label="Nombre" value={name} onChangeText={setName} placeholder="Personal, Trabajo…" autoFocus />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.swatches}>
            {VAULT_COLORS.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchSelected]}
              >
                {color === c ? <Ionicons name="checkmark" size={18} color={Colors.background} /> : null}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Icono</Text>
          <View style={styles.icons}>
            {VAULT_ICONS.map((ic) => (
              <Pressable
                key={ic}
                accessibilityRole="button"
                onPress={() => setIcon(ic)}
                style={[styles.iconBtn, icon === ic && { borderColor: color, backgroundColor: color + '22' }]}
              >
                <Ionicons name={ic} size={24} color={icon === ic ? color : Colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>

        <Button label={isEditing ? 'Guardar cambios' : 'Crear bóveda'} onPress={onSave} disabled={!canSave} loading={saving} />

        {isEditing ? (
          <Pressable accessibilityRole="button" onPress={onDelete} style={styles.deleteWrap}>
            <Text style={styles.deleteText}>Eliminar bóveda</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  topTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 24, gap: 20 },
  section: { gap: 10 },
  sectionLabel: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  swatchSelected: { borderWidth: 2, borderColor: Colors.text },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteWrap: { alignItems: 'center', paddingVertical: 14 },
  deleteText: { color: Colors.danger, fontSize: 15, fontWeight: '600' },
});
