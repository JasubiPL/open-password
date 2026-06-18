/**
 * Cache local con `expo-sqlite` (ADR 0003). Guarda SOLO ciphertext + metadatos
 * no sensibles (timestamps, `vault_id`, flag `deleted` para futuros soft-deletes
 * de la sincronización en la Fase 4). Nada en claro toca el disco.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'openpassword.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
}

/** Crea las tablas si no existen. Idempotente; llamar al desbloquear. */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS vaults (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      vault_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_items_vault ON items (vault_id);
  `);
}

/** Borra todo el cache local (p. ej. al cerrar sesión). */
export async function clearDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM items; DELETE FROM vaults;');
}
