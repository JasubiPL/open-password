import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Colors } from '@/constants/theme';
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
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && !saving;

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
          <TextField label="Título" value={title} onChangeText={setTitle} placeholder="Gmail, Banco…" autoFocus />
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
});
