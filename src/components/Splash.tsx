import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

/** Pantalla de carga con la marca, mientras se decide a dónde navegar. */
export function Splash({ showSpinner = true }: { showSpinner?: boolean }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Image
          source={require('@/assets/branding/splash-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Open Password</Text>
        {showSpinner ? <ActivityIndicator color={Colors.accent} style={styles.spinner} /> : null}
      </View>
      <Text style={styles.footer}>JasubiP® 2015–2026</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  logo: { width: 120, height: 120 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700' },
  spinner: { marginTop: 8 },
  footer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', paddingBottom: 16 },
});
