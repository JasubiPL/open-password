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
  const users = new Map<
    string,
    { id: string; password: string; metadata: { salt?: string; protected_vault_key?: string } }
  >();
  const profiles = new Map<string, { salt: string; protected_vault_key: string }>();
  let current: string | null = null;
  let seq = 0;
  let requireEmailConfirmation = false;

  const userByEmail = (email: string) => {
    for (const [e, u] of users) if (e.toLowerCase() === email.toLowerCase()) return u;
    return undefined;
  };

  const supabase = {
    auth: {
      signUp: async ({
        email,
        password,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: { salt?: string; protected_vault_key?: string } };
      }) => {
        if (userByEmail(email)) {
          return { data: { user: null, session: null }, error: { message: 'already registered' } };
        }
        const id = `u${++seq}`;
        const metadata = options?.data ?? {};
        users.set(email, { id, password, metadata });
        const user = { id, email, user_metadata: metadata };
        if (requireEmailConfirmation) {
          // Confirmación activada: usuario creado, sin sesión.
          return { data: { user, session: null }, error: null };
        }
        current = id;
        return { data: { user, session: { access_token: `tok-${id}`, user } }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const u = userByEmail(email);
        if (!u || u.password !== password) return { data: {}, error: { message: 'invalid login credentials' } };
        current = u.id;
        return { data: { user: { id: u.id, email, user_metadata: u.metadata } }, error: null };
      },
      resend: async () => ({ error: null }),
      signOut: async () => {
        current = null;
        return { error: null };
      },
    },
    rpc: async (fn: string, args: { p_email: string }) => {
      if (fn === 'get_salt_by_email') {
        const u = userByEmail(args.p_email);
        if (!u) return { data: null, error: null };
        // Fallback a metadata como la migración 0002 (profiles primero).
        const salt = profiles.get(u.id)?.salt ?? u.metadata.salt ?? null;
        return { data: salt, error: null };
      }
      return { data: null, error: null };
    },
    from: (table: string) => {
      const writeProfile = (row: { user_id: string; salt: string; protected_vault_key: string }) => {
        if (table === 'profiles') {
          profiles.set(row.user_id, { salt: row.salt, protected_vault_key: row.protected_vault_key });
        }
        return { error: null };
      };
      return {
        insert: async (row: { user_id: string; salt: string; protected_vault_key: string }) => writeProfile(row),
        upsert: async (row: { user_id: string; salt: string; protected_vault_key: string }) => writeProfile(row),
        select: () => ({
          single: async () => {
            if (table === 'profiles' && current && profiles.has(current)) {
              return { data: profiles.get(current), error: null };
            }
            return { data: null, error: { message: 'no encontrado' } };
          },
          maybeSingle: async () => {
            if (table === 'profiles' && current && profiles.has(current)) {
              return { data: profiles.get(current), error: null };
            }
            return { data: null, error: null };
          },
        }),
      };
    },
    __reset: () => {
      users.clear();
      profiles.clear();
      current = null;
      seq = 0;
      requireEmailConfirmation = false;
    },
    __setRequireEmailConfirmation: (value: boolean) => {
      requireEmailConfirmation = value;
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
    const result = await auth.register('User@Test.com', 'Sup3r-Secret!');
    expect(result).toBe('unlocked');
    expect(() => getVaultKey()).not.toThrow();
    expect(getVaultKey()).toHaveLength(32);
  });

  it('con confirmación de email: register no desbloquea y pide confirmar', async () => {
    (supabase as unknown as { __setRequireEmailConfirmation: (v: boolean) => void }).__setRequireEmailConfirmation(true);
    const result = await auth.register('confirm@me.com', 'pw-strong-123');
    expect(result).toBe('emailConfirmationRequired');
    expect(() => getVaultKey()).toThrow(); // bóveda sigue bloqueada
  });

  it('tras confirmar, el primer login materializa el perfil y desbloquea', async () => {
    const setConfirm = (v: boolean) =>
      (supabase as unknown as { __setRequireEmailConfirmation: (v: boolean) => void }).__setRequireEmailConfirmation(v);

    setConfirm(true);
    expect(await auth.register('late@confirm.com', 'pw-strong-123')).toBe('emailConfirmationRequired');
    clearVaultKey();

    // El usuario confirma el email (se vuelve confirmado); ahora puede entrar.
    setConfirm(false);
    await auth.login('late@confirm.com', 'pw-strong-123');
    expect(getVaultKey()).toHaveLength(32);

    // El perfil quedó materializado: unlock funciona sin user_metadata.
    const vk = bytesToHex(getVaultKey());
    clearVaultKey();
    await auth.unlock('pw-strong-123');
    expect(bytesToHex(getVaultKey())).toEqual(vk);
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
