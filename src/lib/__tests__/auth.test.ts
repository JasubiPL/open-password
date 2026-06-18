/**
 * Tests de orquestación del flujo de auth cero-conocimiento.
 * Usa un Supabase falso en memoria; el cripto real corre de verdad para validar
 * que register → login/unlock recupera exactamente la misma Vault Key.
 */
import * as auth from '../auth';
import { supabase } from '../supabase';
import { bytesToHex, clearVaultKey, configureArgon2Params, getVaultKey } from '@/crypto';

// Argon2id con parámetros de producción es muy lento en JS puro; para los tests
// usamos parámetros reducidos (el round-trip es válido igual: protect y unprotect
// derivan con los mismos parámetros).
beforeAll(() => configureArgon2Params({ t: 2, m: 256, p: 1, dkLen: 32 }));

jest.mock('../supabase', () => {
  const users = new Map<string, { id: string; password: string }>();
  const profiles = new Map<string, { salt: string; protected_vault_key: string }>();
  let current: string | null = null;
  let seq = 0;

  const supabase = {
    auth: {
      signUp: async ({ email, password }: { email: string; password: string }) => {
        if (users.has(email)) return { data: { user: null }, error: { message: 'ya existe' } };
        const id = `u${++seq}`;
        users.set(email, { id, password });
        current = id;
        return { data: { user: { id, email } }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const u = users.get(email);
        if (!u || u.password !== password) return { data: {}, error: { message: 'credenciales' } };
        current = u.id;
        return { data: { user: { id: u.id, email } }, error: null };
      },
      signOut: async () => {
        current = null;
        return { error: null };
      },
    },
    rpc: async (fn: string, args: { p_email: string }) => {
      if (fn === 'get_salt_by_email') {
        for (const [email, u] of users) {
          if (email.toLowerCase() === args.p_email.toLowerCase() && profiles.has(u.id)) {
            return { data: profiles.get(u.id)!.salt, error: null };
          }
        }
        return { data: null, error: null };
      }
      return { data: null, error: null };
    },
    from: (table: string) => ({
      insert: async (row: { user_id: string; salt: string; protected_vault_key: string }) => {
        if (table === 'profiles') {
          profiles.set(row.user_id, { salt: row.salt, protected_vault_key: row.protected_vault_key });
        }
        return { error: null };
      },
      select: () => ({
        single: async () => {
          if (table === 'profiles' && current && profiles.has(current)) {
            return { data: profiles.get(current), error: null };
          }
          return { data: null, error: { message: 'no encontrado' } };
        },
      }),
    }),
    __reset: () => {
      users.clear();
      profiles.clear();
      current = null;
      seq = 0;
    },
  };
  return { supabase, isSupabaseConfigured: () => true };
});

beforeEach(() => {
  (supabase as unknown as { __reset: () => void }).__reset();
  clearVaultKey();
});

describe('auth (zero-knowledge orchestration)', () => {
  it('register deja la bóveda desbloqueada con una Vault Key', async () => {
    await auth.register('User@Test.com', 'Sup3r-Secret!');
    expect(() => getVaultKey()).not.toThrow();
    expect(getVaultKey()).toHaveLength(32);
  });

  it('unlock tras reiniciar recupera la misma Vault Key', async () => {
    await auth.register('user@test.com', 'Sup3r-Secret!');
    const vk1 = bytesToHex(getVaultKey());
    clearVaultKey(); // simula cierre de la app (la sesión persiste, la RAM no)

    await auth.unlock('Sup3r-Secret!');
    expect(bytesToHex(getVaultKey())).toEqual(vk1);
  });

  it('login en un dispositivo nuevo recupera la misma Vault Key', async () => {
    await auth.register('a@b.com', 'pw-strong-123');
    const vk1 = bytesToHex(getVaultKey());
    await auth.logout();
    clearVaultKey();

    await auth.login('a@b.com', 'pw-strong-123');
    expect(bytesToHex(getVaultKey())).toEqual(vk1);
  });

  it('unlock falla con contraseña incorrecta', async () => {
    await auth.register('c@d.com', 'right-pass-1');
    clearVaultKey();
    await expect(auth.unlock('wrong-pass-1')).rejects.toThrow();
  });

  it('login con email inexistente lanza error', async () => {
    await expect(auth.login('nope@x.com', 'whatever-12')).rejects.toThrow();
  });
});
