import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { copyWithAutoClear } from '@/lib/clipboard';
import {
  DEFAULT_GENERATOR_OPTIONS,
  GENERATOR_LENGTH,
  entropyBits,
  generatePassword,
  strengthFromBits,
  type GeneratorOptions,
} from '@/lib/generator';

const STRENGTH_COPY: Record<ReturnType<typeof strengthFromBits>, { label: string; color: string }> = {
  weak: { label: 'Débil', color: Colors.danger },
  medium: { label: 'Media', color: Colors.warning },
  strong: { label: 'Fuerte', color: Colors.success },
};

/** Colorea dígitos/símbolos como en el diseño para legibilidad. */
function ColoredPassword({ value }: { value: string }) {
  return (
    <Text style={styles.password}>
      {value.split('').map((ch, i) => {
        let color: string = Colors.text;
        if (/[0-9]/.test(ch)) color = Colors.accent;
        else if (/[^a-zA-Z0-9]/.test(ch)) color = Colors.warning;
        return (
          <Text key={i} style={{ color }}>
            {ch}
          </Text>
        );
      })}
    </Text>
  );
}

export default function Generator() {
  const [opts, setOpts] = useState<GeneratorOptions>(DEFAULT_GENERATOR_OPTIONS);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback((o: GeneratorOptions) => setPassword(generatePassword(o)), []);

  useEffect(() => {
    regenerate(opts);
    // Regenera cuando cambian las opciones (longitud/toggles).
  }, [opts, regenerate]);

  const set = <K extends keyof GeneratorOptions>(key: K, val: GeneratorOptions[K]) =>
    setOpts((prev) => ({ ...prev, [key]: val }));

  const bits = entropyBits({ ...opts, length: password.length || opts.length });
  const strength = STRENGTH_COPY[strengthFromBits(bits)];

  const onCopy = async () => {
    await copyWithAutoClear(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Generador</Text>
          <Text style={styles.subtitle}>Contraseñas fuertes, al instante</Text>
        </View>

      <View style={styles.display}>
        <ColoredPassword value={password} />
        <View style={styles.displayFooter}>
          <View style={styles.strengthRow}>
            <View style={[styles.dot, { backgroundColor: strength.color }]} />
            <Text style={[styles.strengthText, { color: strength.color }]}>
              {strength.label} · {bits} bits
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Regenerar"
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              onPress={() => regenerate(opts)}
            >
              <Ionicons name="refresh" size={20} color={Colors.text} />
            </Pressable>
            <Pressable
              accessibilityLabel="Copiar"
              style={({ pressed }) => [styles.iconBtn, styles.iconBtnAccent, pressed && styles.pressed]}
              onPress={onCopy}
            >
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={20} color={Colors.background} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.lengthRow}>
        <Text style={styles.label}>Longitud</Text>
        <Text style={styles.lengthValue}>{opts.length}</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={GENERATOR_LENGTH.min}
        maximumValue={GENERATOR_LENGTH.max}
        step={1}
        value={opts.length}
        onValueChange={(v) => set('length', Math.round(v))}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.accent}
      />
      <View style={styles.lengthBounds}>
        <Text style={styles.bound}>{GENERATOR_LENGTH.min}</Text>
        <Text style={styles.bound}>{GENERATOR_LENGTH.max}</Text>
      </View>

      <View style={styles.options}>
        <OptionRow label="Mayúsculas" hint="A-Z" value={opts.uppercase} onChange={(v) => set('uppercase', v)} />
        <OptionRow label="Números" hint="0-9" value={opts.numbers} onChange={(v) => set('numbers', v)} />
        <OptionRow label="Símbolos" hint="!@#" value={opts.symbols} onChange={(v) => set('symbols', v)} />
        <OptionRow
          label="Evitar ambiguos"
          hint="l1O0"
          value={opts.avoidAmbiguous}
          onChange={(v) => set('avoidAmbiguous', v)}
          last
        />
      </View>

        <View style={styles.footer}>
          <Button label={copied ? 'Copiada ✓' : 'Copiar contraseña'} onPress={onCopy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionRow({
  label,
  hint,
  value,
  onChange,
  last,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.optionRow, !last && styles.optionDivider]}>
      <Text style={styles.optionLabel}>
        {label} <Text style={styles.optionHint}>{hint}</Text>
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.surfaceAlt, true: Colors.accent }}
        thumbColor={Colors.text}
        ios_backgroundColor={Colors.surfaceAlt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 24, flexGrow: 1 },
  header: { paddingTop: 8, marginBottom: 20, gap: 4 },
  title: { color: Colors.text, fontSize: 30, fontWeight: '700' },
  subtitle: { color: Colors.textMuted, fontSize: 14 },
  display: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  password: { fontSize: 22, fontFamily: 'monospace', letterSpacing: 1, lineHeight: 30 },
  displayFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  strengthText: { fontSize: 14, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnAccent: { backgroundColor: Colors.accent },
  pressed: { opacity: 0.7 },
  lengthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 },
  label: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  lengthValue: { color: Colors.accent, fontSize: 20, fontWeight: '700' },
  slider: { width: '100%', height: 40, marginTop: 4 },
  lengthBounds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -6 },
  bound: { color: Colors.textMuted, fontSize: 12 },
  options: { marginTop: 20 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionLabel: { color: Colors.text, fontSize: 16, fontWeight: '500' },
  optionHint: { color: Colors.textMuted, fontSize: 13, fontFamily: 'monospace' },
  footer: { marginTop: 'auto', paddingBottom: 16 },
});
