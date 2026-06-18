/**
 * Cliente de Supabase (Auth + Postgres) configurado para Expo / React Native.
 * Ver ADR 0003.
 *
 * - La sesión se persiste con AsyncStorage (Supabase no toca las claves de
 *   cifrado: solo guarda el JWT). El modelo cero-conocimiento se mantiene porque
 *   el servidor nunca ve la contraseña maestra ni las claves (ver ADR 0002).
 * - `react-native-url-polyfill` es necesario porque supabase-js usa la API `URL`.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // No lanzamos en import para no romper el arranque en dev sin .env; avisamos.
  console.warn(
    '[supabase] Falta EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_KEY. ' +
      'Copiá .env.example a .env y completá los valores.',
  );
}

export const supabase = createClient(supabaseUrl ?? 'http://localhost', supabaseAnonKey ?? 'anon', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Las apps móviles no usan el callback de URL para detectar la sesión.
    detectSessionInUrl: false,
  },
});

/** True si las variables de entorno de Supabase están configuradas. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
