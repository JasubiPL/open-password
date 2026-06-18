/**
 * Sincronización con Supabase (Fase 4). Ver ADR 0003.
 *
 * Estrategia, offline-first y a prueba de cero-conocimiento (el servidor solo ve
 * ciphertext en `data`):
 *
 *  1. **Push**: sube las filas locales con `dirty = 1` (creadas/editadas/borradas
 *     sin sincronizar) vía upsert, y las marca limpias.
 *  2. **Pull**: trae las filas remotas con `updated_at > cursor` (incluye
 *     soft-deletes) y aplica **last-writer-wins** por `updated_at`: la remota
 *     gana solo si es estrictamente más nueva que la local.
 *
 * `updated_at` es epoch en ms generado por el cliente (igual que el cache local).
 * No hay merge a nivel de campo: cada registro es un blob cifrado opaco, así que
 * el conflicto se resuelve a nivel de fila. Trade-off de reloj entre dispositivos
 * aceptado para el MVP.
 *
 * Este módulo solo toca SQLite + red; el refresco de la vista en RAM lo orquesta
 * el store (`useVaults.sync()`), para evitar dependencias circulares.
 */
import { getDb } from '@/db/database';
import { supabase } from '@/lib/supabase';

export interface SyncResult {
  pushed: number;
  pulled: number;
  skipped: boolean; // true si no había sesión (sin red/sin login)
}

interface LocalVaultRow {
  id: string;
  data: string;
  created_at: number;
  updated_at: number;
  deleted: number;
}
interface LocalItemRow extends LocalVaultRow {
  vault_id: string;
}

interface RemoteRow {
  id: string;
  vault_id?: string;
  data: string;
  created_at: number;
  updated_at: number;
  deleted: boolean;
}

type Db = Awaited<ReturnType<typeof getDb>>;

async function getCursor(db: Db, key: string): Promise<number> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM sync_meta WHERE key = ?', [key]);
  return row ? Number(row.value) : 0;
}

async function setCursor(db: Db, key: string, value: number): Promise<void> {
  await db.runAsync(
    'INSERT INTO sync_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, String(value)],
  );
}

/** Sube las filas `dirty` de `vaults` y `items`. Devuelve cuántas subió. */
async function pushDirty(db: Db, userId: string): Promise<number> {
  let pushed = 0;

  const vaults = await db.getAllAsync<LocalVaultRow>(
    'SELECT id, data, created_at, updated_at, deleted FROM vaults WHERE dirty = 1',
  );
  if (vaults.length > 0) {
    const { error } = await supabase.from('vaults').upsert(
      vaults.map((v) => ({
        id: v.id,
        user_id: userId,
        data: v.data,
        created_at: v.created_at,
        updated_at: v.updated_at,
        deleted: Boolean(v.deleted),
      })),
    );
    if (error) throw error;
    // Marca limpio solo si no cambió mientras subíamos (offline-first seguro).
    for (const v of vaults) {
      await db.runAsync('UPDATE vaults SET dirty = 0 WHERE id = ? AND updated_at = ?', [v.id, v.updated_at]);
    }
    pushed += vaults.length;
  }

  const items = await db.getAllAsync<LocalItemRow>(
    'SELECT id, vault_id, data, created_at, updated_at, deleted FROM items WHERE dirty = 1',
  );
  if (items.length > 0) {
    const { error } = await supabase.from('items').upsert(
      items.map((it) => ({
        id: it.id,
        user_id: userId,
        vault_id: it.vault_id,
        data: it.data,
        created_at: it.created_at,
        updated_at: it.updated_at,
        deleted: Boolean(it.deleted),
      })),
    );
    if (error) throw error;
    for (const it of items) {
      await db.runAsync('UPDATE items SET dirty = 0 WHERE id = ? AND updated_at = ?', [it.id, it.updated_at]);
    }
    pushed += items.length;
  }

  return pushed;
}

/** Trae los cambios remotos de `vaults`. Devuelve cuántos aplicó. */
async function pullVaults(db: Db): Promise<number> {
  const cursor = await getCursor(db, 'cursor_vaults');
  const { data, error } = await supabase
    .from('vaults')
    .select('id, data, created_at, updated_at, deleted')
    .gt('updated_at', cursor)
    .order('updated_at', { ascending: true });
  if (error) throw error;

  let applied = 0;
  let maxCursor = cursor;
  for (const r of (data ?? []) as RemoteRow[]) {
    maxCursor = Math.max(maxCursor, r.updated_at);
    const local = await db.getFirstAsync<{ updated_at: number }>('SELECT updated_at FROM vaults WHERE id = ?', [r.id]);
    if (local && local.updated_at >= r.updated_at) continue; // local igual o más nuevo: gana local
    await db.runAsync(
      `INSERT INTO vaults (id, data, created_at, updated_at, deleted, dirty)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, created_at = excluded.created_at,
         updated_at = excluded.updated_at, deleted = excluded.deleted, dirty = 0`,
      [r.id, r.data, r.created_at, r.updated_at, r.deleted ? 1 : 0],
    );
    applied += 1;
  }
  if (maxCursor > cursor) await setCursor(db, 'cursor_vaults', maxCursor);
  return applied;
}

/** Trae los cambios remotos de `items`. Devuelve cuántos aplicó. */
async function pullItems(db: Db): Promise<number> {
  const cursor = await getCursor(db, 'cursor_items');
  const { data, error } = await supabase
    .from('items')
    .select('id, vault_id, data, created_at, updated_at, deleted')
    .gt('updated_at', cursor)
    .order('updated_at', { ascending: true });
  if (error) throw error;

  let applied = 0;
  let maxCursor = cursor;
  for (const r of (data ?? []) as RemoteRow[]) {
    maxCursor = Math.max(maxCursor, r.updated_at);
    const local = await db.getFirstAsync<{ updated_at: number }>('SELECT updated_at FROM items WHERE id = ?', [r.id]);
    if (local && local.updated_at >= r.updated_at) continue;
    await db.runAsync(
      `INSERT INTO items (id, vault_id, data, created_at, updated_at, deleted, dirty)
       VALUES (?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(id) DO UPDATE SET vault_id = excluded.vault_id, data = excluded.data,
         created_at = excluded.created_at, updated_at = excluded.updated_at,
         deleted = excluded.deleted, dirty = 0`,
      [r.id, r.vault_id ?? '', r.data, r.created_at, r.updated_at, r.deleted ? 1 : 0],
    );
    applied += 1;
  }
  if (maxCursor > cursor) await setCursor(db, 'cursor_items', maxCursor);
  return applied;
}

/**
 * Sincroniza una vez: push de cambios locales + pull de cambios remotos.
 * No-op (skipped) si no hay sesión de Supabase. Lanza si falla la red.
 */
export async function syncNow(): Promise<SyncResult> {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return { pushed: 0, pulled: 0, skipped: true };

  const db = await getDb();
  // Push primero: deja el servidor al día antes de traer cambios remotos, de
  // modo que el pull vea nuestras filas con su `updated_at` y no las pise.
  const pushed = await pushDirty(db, userId);
  const pulled = (await pullVaults(db)) + (await pullItems(db));
  return { pushed, pulled, skipped: false };
}
