/**
 * Estado de sesión global (Zustand).
 *
 * Modela dos ejes ortogonales:
 *  - `status`: si hay sesión de Supabase (loading | signedOut | signedIn).
 *  - `unlocked`: si la Vault Key está en RAM (la bóveda se puede leer).
 *
 * Una sesión puede estar `signedIn` pero **bloqueada** (tras re-abrir la app):
 * el JWT persiste, pero la Vault Key vive solo en RAM y se pierde al cerrar.
 * Ver ADR 0002.
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { clearVaultKey, isUnlocked } from '@/crypto';
import * as auth from '@/lib/auth';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  email: string | null;
  unlocked: boolean;

  /** Lee la sesión persistida y suscribe a cambios de auth. Llamar al arrancar. */
  bootstrap: () => Promise<() => void>;
  /** Refresca `unlocked` desde el estado real de la Vault Key en RAM. */
  syncUnlocked: () => void;
  register: (email: string, masterPassword: string) => Promise<auth.RegisterResult>;
  login: (email: string, masterPassword: string) => Promise<void>;
  unlock: (masterPassword: string) => Promise<void>;
  lock: () => void;
  logout: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  status: 'loading',
  email: null,
  unlocked: isUnlocked(),

  bootstrap: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      status: data.session ? 'signedIn' : 'signedOut',
      email: data.session?.user?.email ?? null,
      unlocked: isUnlocked(),
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        status: session ? 'signedIn' : 'signedOut',
        email: session?.user?.email ?? null,
        unlocked: isUnlocked(),
      });
    });
    return () => sub.subscription.unsubscribe();
  },

  syncUnlocked: () => set({ unlocked: isUnlocked() }),

  register: async (email, masterPassword) => {
    const result = await auth.register(email, masterPassword);
    if (result === 'unlocked') {
      set({ status: 'signedIn', email: email.trim().toLowerCase(), unlocked: isUnlocked() });
    }
    return result;
  },

  login: async (email, masterPassword) => {
    await auth.login(email, masterPassword);
    set({ status: 'signedIn', email: email.trim().toLowerCase(), unlocked: isUnlocked() });
  },

  unlock: async (masterPassword) => {
    await auth.unlock(masterPassword);
    set({ unlocked: isUnlocked() });
  },

  lock: () => {
    clearVaultKey();
    set({ unlocked: false });
  },

  logout: async () => {
    await auth.logout();
    set({ status: 'signedOut', email: null, unlocked: false });
  },
}));
