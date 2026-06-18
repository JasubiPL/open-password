import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Colors } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  /** Muestra el toggle de mostrar/ocultar (para contraseñas). */
  secure?: boolean;
}

export function TextField({ label, error, secure, style, ...inputProps }: TextFieldProps) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure ? hidden : false}
          autoCapitalize="none"
          autoCorrect={false}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
          >
            <Text style={styles.toggle}>{hidden ? 'Mostrar' : 'Ocultar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputRowError: { borderColor: Colors.danger },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 14 },
  toggle: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  error: { color: Colors.danger, fontSize: 12 },
});
