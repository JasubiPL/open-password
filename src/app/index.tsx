import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/branding/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Open Password</Text>
        <Text style={styles.subtitle}>
          Gestor de contraseñas cero-conocimiento
        </Text>
      </View>

      <Text style={styles.footer}>JasubiP® 2015–2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 140,
    height: 140,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 15,
  },
  footer: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingBottom: 16,
  },
});
