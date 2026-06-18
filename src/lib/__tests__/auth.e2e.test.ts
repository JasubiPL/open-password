/**
 * E2E de autenticación contra el Supabase REAL (cierra la verificación de Fase 2).
 *
 * A diferencia de `auth.test.ts` (Supabase en memoria), aquí inyectamos un cliente
 * de red real apuntando a las credenciales de `.env.local`/`.env`, y corremos el
 * cripto real. Valida que register → login → unlock recupera la MISMA Vault Key
 * pasando por el backend (Auth + RLS + RPC prelogin).
 *
 * Es OPT-IN: solo corre con `RUN_E2E=1` (ver `npm run test:e2e`). Por defecto se
 * salta para no tocar la red ni crear usuarios en cada `npm test`.
 *
 * Nota: crea un usuario de prueba (`e2e-<ts>@example.com`) que NO se puede borrar
 * con la anon key. Requiere que el proyecto tenga "Confirm email" DESACTIVADO
 * (Auth → Providers → Email), si no el login no obtiene sesión.
 */
const RUN = process.env.RUN_E2E === '1';

// Inyecta un cliente Supabase de red real en lugar del singleton (que usa
// AsyncStorage de RN y no corre en Node). El factory no puede referenciar
// variables externas, así que requerimos `fs` aquí dentro.
jest.mock('../supabase', () => {
  const { readFileSync } = require('node:fs');
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {
      /* el archivo puede no existir */
    }
  }
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'http://localhost';
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? 'anon';
  return {
    supabase: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }),
    isSupabaseConfigured: () =>
      Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_KEY),
  };
});

import * as auth from '../auth';
import { bytesToHex, clearVaultKey, getVaultKey } from '@/crypto';

const d = RUN ? describe : describe.skip;

d('auth E2E (Supabase real)', () => {
  const email = `e2e-${Date.now()}@example.com`;
  const masterPassword = 'Correct-Horse-Battery-Staple-9';

  jest.setTimeout(60_000); // Argon2id real + red

  it('register → login → unlock recupera la misma Vault Key', async () => {
    // 1. Registro: deja la bóveda desbloqueada en RAM.
    const result = await auth.register(email, masterPassword);
    if (result !== 'unlocked') {
      throw new Error(
        'register devolvió "emailConfirmationRequired". Desactivá "Confirm email" ' +
          'en Supabase (Auth → Providers → Email) para correr el E2E.',
      );
    }
    const afterRegister = bytesToHex(getVaultKey());
    expect(afterRegister).toHaveLength(64); // AES-256 = 32 bytes

    // 2. Login (simula dispositivo nuevo): prelogin → derivar → autenticar → desenvolver.
    clearVaultKey();
    await auth.login(email, masterPassword);
    expect(bytesToHex(getVaultKey())).toBe(afterRegister);

    // 3. Unlock (sesión ya presente): re-deriva con la maestra y desenvuelve.
    clearVaultKey();
    await auth.unlock(masterPassword);
    expect(bytesToHex(getVaultKey())).toBe(afterRegister);

    // 4. Contraseña incorrecta: el desbloqueo debe fallar (autenticación GCM).
    clearVaultKey();
    await expect(auth.unlock('wrong-password')).rejects.toThrow();

    await auth.logout();
  });
});
