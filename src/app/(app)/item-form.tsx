import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { PlatformIcon } from '@/components/PlatformIcon';
import { PlatformPicker } from '@/components/PlatformPicker';
import { Colors } from '@/constants/theme';
import { getPlatform } from '@/constants/platforms';
import { useVaults, type ItemInput } from '@/store/vaults';

export default function ItemForm() {
  const router = useRouter();
  const { id, vaultId } = useLocalSearchParams<{ id?: string; vaultId?: string }>();
  const existing = useVaults((s) => s.items.find((it) => it.id === id));
  const createItem = useVaults((s) => s.createItem);
  const updateItem = useVaults((s) => s.updateItem);
  const isEditing = Boolean(existing);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [username, setUsername] = useState(existing?.username ?? '');
  const [password, setPassword] = useState(existing?.password ?? '');
  const [url, setUrl] = useState(existing?.url ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [platform, setPlatform] = useState(existing?.platform ?? '');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedPlatform = getPlatform(platform);
  const canSave = title.trim().length > 0 && !saving;

  const onPickPlatform = (p: ReturnType<typeof getPlatform> | null) => {
    if (!p) {
      setPlatform('');
      return;
    }
    setPlatform(p.id);
    if (!title.trim() && p.kind === 'brand') setTitle(p.name);
    if (p.url && !url.trim()) setUrl(p.url); // autocompleta la URL si la marca la tiene
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const input: ItemInput = {
        title: title.trim(),
        username: username.trim(),
        password,
        url: url.trim(),
        notes,
        category: category.trim(),
        platform,
      };
      if (existing) await updateItem(existing.id, input);
      else if (vaultId) await createItem(vaultId, input);
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la entrada.');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{isEditing ? 'Editar entrada' : 'Nueva entrada'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Elegir plataforma"
            style={styles.platformRow}
            onPress={() => setPickerOpen(true)}
          >
            <PlatformIcon platform={platform} title={title} size={44} />
            <View style={styles.platformText}>
              <Text style={styles.platformLabel}>Plataforma</Text>
              <Text style={styles.platformValue}>{selectedPlatform?.name ?? 'Personalizada'}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
          </Pressable>

          <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Gmail, Banco…" />
          <TextField
            label="Usuario / email"
            value={username}
            onChangeText={setUsername}
            placeholder="tu usuario"
            autoCapitalize="none"
          />
          <TextField label="Contraseña" value={password} onChangeText={setPassword} placeholder="••••••••" secure />
          <TextField
            label="Sitio / URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://…"
            autoCapitalize="none"
            keyboardType="url"
          />
          <TextField label="Categoría" value={category} onChangeText={setCategory} placeholder="Personal, Trabajo…" />
          <TextField
            label="Notas"
            value={notes}
            onChangeText={setNotes}
            placeholder="Notas (opcional)"
            multiline
            numberOfLines={3}
            style={styles.notes}
          />

          <Button label={isEditing ? 'Guardar cambios' : 'Crear entrada'} onPress={onSave} disabled={!canSave} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PlatformPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onPickPlatform} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  topTitle: { color: Colors.text, fontSize: 17, fontWeight: '700' },
  content: { padding: 24, gap: 16 },
  notes: { minHeight: 72, textAlignVertical: 'top' },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  platformText: { flex: 1, gap: 2 },
  platformLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  platformValue: { color: Colors.text, fontSize: 16, fontWeight: '600' },
});
