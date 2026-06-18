/**
 * Preferencias de la app (Fase 6) persistidas en AsyncStorage.
 *
 * No son sensibles (no tocan claves ni datos cifrados): solo ajustes de UX y
 * seguridad superficial (auto-bloqueo, bloqueo de capturas). Se cargan al
 * arrancar y se guardan en cada cambio.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEY = 'open-password.prefs';

/** Minutos de inactividad (en segundo plano) antes de bloquear. 0 = al salir. */
export const AUTO_LOCK_OPTIONS = [
  { minutes: 0, label: 'Al salir' },
  { minutes: 1, label: '1 min' },
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
] as const;

interface Preferences {
  autoLockMinutes: number;
  blockScreenshots: boolean;
}

const DEFAULTS: Preferences = {
  autoLockMinutes: 1,
  blockScreenshots: false,
};

interface PreferencesState extends Preferences {
  loaded: boolean;
  load: () => Promise<void>;
  setAutoLockMinutes: (minutes: number) => void;
  setBlockScreenshots: (value: boolean) => void;
}

async function persist(prefs: Preferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* persistencia best-effort */
  }
}

export const usePreferences = create<PreferencesState>((set, get) => ({
  ...DEFAULTS,
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as Partial<Preferences>) : {};
      set({
        autoLockMinutes:
          typeof stored.autoLockMinutes === 'number' ? stored.autoLockMinutes : DEFAULTS.autoLockMinutes,
        blockScreenshots:
          typeof stored.blockScreenshots === 'boolean' ? stored.blockScreenshots : DEFAULTS.blockScreenshots,
        loaded: true,
      });
    } catch {
      set({ ...DEFAULTS, loaded: true });
    }
  },

  setAutoLockMinutes: (minutes) => {
    set({ autoLockMinutes: minutes });
    void persist({ autoLockMinutes: minutes, blockScreenshots: get().blockScreenshots });
  },

  setBlockScreenshots: (value) => {
    set({ blockScreenshots: value });
    void persist({ autoLockMinutes: get().autoLockMinutes, blockScreenshots: value });
  },
}));
