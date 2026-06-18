import { useState } from 'react';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';

const SLIDES = [
  {
    title: 'Tus contraseñas, cifradas y solo tuyas',
    body: 'Cifrado de extremo a extremo (cero-conocimiento). Ni nosotros podemos leerlas.',
  },
  {
    title: 'Organizá en bóvedas',
    body: 'Personal, Familia, Trabajo, Proyectos. Cada cosa en su lugar.',
  },
  {
    title: 'Importá tu Excel y desbloqueá con tu huella',
    body: 'Llevá tus credenciales y entrá con Face ID o huella.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <SafeAreaView style={styles.safe}>
      <Image
        source={require('@/assets/branding/splash-icon.png')}
        style={styles.logo}
        contentFit="contain"
      />

      <FlatList
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="Empezar" onPress={() => router.push('/register')} />
        <Link href="/login" asChild>
          <Pressable accessibilityRole="button" style={styles.linkWrap}>
            <Text style={styles.link}>Ya tengo cuenta</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.footer}>JasubiP® 2015–2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  logo: { width: 84, height: 84, alignSelf: 'center', marginTop: 24 },
  slide: { paddingHorizontal: 32, alignItems: 'center', justifyContent: 'center', gap: 14, flex: 1 },
  title: { color: Colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center' },
  body: { color: Colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.accent, width: 20 },
  actions: { paddingHorizontal: 24, gap: 8 },
  linkWrap: { alignItems: 'center', paddingVertical: 12 },
  link: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingVertical: 12 },
});
