/**
 * Estado de bóvedas e items (Zustand), descifrados en memoria.
 *
 * El cache local (`expo-sqlite`) guarda ciphertext; este store mantiene la vista
 * descifrada para la UI y la búsqueda en memoria (ADR 0002 / 0003). La
 * sincronización con Supabase llega en la Fase 4.
 */
import { create } from 'zustand';
import { getDb, clearDatabase } from '@/db/database';
import { decryptRecord, encryptRecord } from '@/lib/vaultCrypto';
import { newId } from '@/lib/id';
import { syncNow } from '@/lib/sync';

/** Empuja cambios locales al servidor en segundo plano (best-effort, sin red → no-op). */
function pushInBackground(): void {
  void syncNow().catch(() => {});
}

export interface Vault {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultItem {
  id: string;
  vaultId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  category: string;
  /** Id de plataforma del catálogo (`platforms.ts`); vacío si es personalizada. */
  platform: string;
  createdAt: number;
  updatedAt: number;
}

/** Campos editables de una bóveda. */
export type VaultInput = Pick<Vault, 'name' | 'icon' | 'color'>;
/** Campos editables de un item. */
export type ItemInput = Pick<
  VaultItem,
  'title' | 'username' | 'password' | 'url' | 'notes' | 'category' | 'platform'
>;

interface VaultsState {
  vaults: Vault[];
  items: VaultItem[];
  loaded: boolean;
  /** Sincronización en curso. */
  syncing: boolean;
  /** Timestamp (ms) de la última sync exitosa, o null. */
  lastSyncedAt: number | null;
  /** Resultado del último intento: true ok, false falló (sin red), null sin intentar. */
  lastSyncOk: boolean | null;

  load: () => Promise<void>;
  /** Sincroniza con Supabase (push + pull) y recarga la vista descifrada. */
  sync: () => Promise<void>;
  reset: () => void;
  createVault: (input: VaultInput) => Promise<Vault>;
  updateVault: (id: string, input: VaultInput) => Promise<void>;
  deleteVault: (id: string) => Promise<void>;
  createItem: (vaultId: string, input: ItemInput) => Promise<VaultItem>;
  updateItem: (id: string, input: ItemInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

// Campos cifrados de cada registro (lo que va dentro del blob).
type VaultData = Pick<Vault, 'name' | 'icon' | 'color'>;
type ItemData = Pick<
  VaultItem,
  'title' | 'username' | 'password' | 'url' | 'notes' | 'category' | 'platform'
>;

export const useVaults = create<VaultsState>((set, get) => ({
  vaults: [],
  items: [],
  loaded: false,
  syncing: false,
  lastSyncedAt: null,
  lastSyncOk: null,

  load: async () => {
    const db = await getDb();
    const vaultRows = await db.getAllAsync<{ id: string; data: string; created_at: number; updated_at: number }>(
      'SELECT id, data, created_at, updated_at FROM vaults WHERE deleted = 0 ORDER BY updated_at DESC',
    );
    const itemRows = await db.getAllAsync<{ id: string; vault_id: string; data: string; created_at: number; updated_at: number }>(
      'SELECT id, vault_id, data, created_at, updated_at FROM items WHERE deleted = 0 ORDER BY updated_at DESC',
    );

    const vaults: Vault[] = vaultRows.map((r) => {
      const d = decryptRecord<VaultData>(r.data);
      return { id: r.id, name: d.name, icon: d.icon, color: d.color, createdAt: r.created_at, updatedAt: r.updated_at };
    });
    const items: VaultItem[] = itemRows.map((r) => {
      const d = decryptRecord<ItemData>(r.data);
      return {
        id: r.id,
        vaultId: r.vault_id,
        ...d,
        platform: d.platform ?? '', // compat con items previos sin plataforma
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });

    set({ vaults, items, loaded: true });
  },

  sync: async () => {
    if (get().syncing) return; // evita syncs concurrentes
    set({ syncing: true });
    try {
      const result = await syncNow();
      // Solo recargamos si el pull trajo cambios remotos (evita parpadeos).
      if (result.pulled > 0) await get().load();
      if (!result.skipped) set({ lastSyncedAt: Date.now(), lastSyncOk: true });
    } catch {
      set({ lastSyncOk: false }); // sin red / error: queda pendiente para el próximo intento
    } finally {
      set({ syncing: false });
    }
  },

  reset: () =>
    set({ vaults: [], items: [], loaded: false, syncing: false, lastSyncedAt: null, lastSyncOk: null }),

  createVault: async (input) => {
    const db = await getDb();
    const now = Date.now();
    const vault: Vault = { id: newId(), ...input, createdAt: now, updatedAt: now };
    const data: VaultData = { name: input.name, icon: input.icon, color: input.color };
    await db.runAsync('INSERT INTO vaults (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)', [
      vault.id,
      encryptRecord(data),
      now,
      now,
    ]);
    set({ vaults: [vault, ...get().vaults] });
    pushInBackground();
    return vault;
  },

  updateVault: async (id, input) => {
    const db = await getDb();
    const now = Date.now();
    const data: VaultData = { name: input.name, icon: input.icon, color: input.color };
    await db.runAsync('UPDATE vaults SET data = ?, updated_at = ?, dirty = 1 WHERE id = ?', [encryptRecord(data), now, id]);
    set({
      vaults: get().vaults.map((v) => (v.id === id ? { ...v, ...input, updatedAt: now } : v)),
    });
    pushInBackground();
  },

  deleteVault: async (id) => {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync('UPDATE vaults SET deleted = 1, updated_at = ?, dirty = 1 WHERE id = ?', [now, id]);
    await db.runAsync('UPDATE items SET deleted = 1, updated_at = ?, dirty = 1 WHERE vault_id = ?', [now, id]);
    set({
      vaults: get().vaults.filter((v) => v.id !== id),
      items: get().items.filter((it) => it.vaultId !== id),
    });
    pushInBackground();
  },

  createItem: async (vaultId, input) => {
    const db = await getDb();
    const now = Date.now();
    const item: VaultItem = { id: newId(), vaultId, ...input, createdAt: now, updatedAt: now };
    await db.runAsync('INSERT INTO items (id, vault_id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [
      item.id,
      vaultId,
      encryptRecord(input),
      now,
      now,
    ]);
    set({ items: [item, ...get().items] });
    pushInBackground();
    return item;
  },

  updateItem: async (id, input) => {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync('UPDATE items SET data = ?, updated_at = ?, dirty = 1 WHERE id = ?', [encryptRecord(input), now, id]);
    set({
      items: get().items.map((it) => (it.id === id ? { ...it, ...input, updatedAt: now } : it)),
    });
    pushInBackground();
  },

  deleteItem: async (id) => {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync('UPDATE items SET deleted = 1, updated_at = ?, dirty = 1 WHERE id = ?', [now, id]);
    set({ items: get().items.filter((it) => it.id !== id) });
    pushInBackground();
  },
}));

/** Limpia memoria y cache local (al cerrar sesión). */
export async function wipeLocalVaults(): Promise<void> {
  useVaults.getState().reset();
  await clearDatabase();
}
