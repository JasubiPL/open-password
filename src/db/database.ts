/**
 * Cache local con `expo-sqlite` (ADR 0003). Guarda SOLO ciphertext + metadatos
 * no sensibles (timestamps, `vault_id`, flag `deleted` para soft-deletes). Nada
 * en claro toca el disco.
 *
 * Fase 4 (sync): cada fila lleva un flag `dirty` (cambios locales pendientes de
 * subir) y la tabla `sync_meta` guarda el cursor de pull por tabla. Ver `sync.ts`.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'openpassword.db';
const SCHEMA_VERSION = 2; // 1 = Fase 3 (vaults/items); 2 = Fase 4 (dirty + sync_meta)

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  return dbPromise;
}

/** Añade una columna si todavía no existe (migración idempotente). */
async function addColumnIfMissing(
  db: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

/** Crea las tablas si no existen y migra esquemas antiguos. Idempotente. */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS vaults (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      dirty INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY NOT NULL,
      vault_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      dirty INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_items_vault ON items (vault_id);
    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Installs de Fase 3 (sin `dirty`): añadir la columna. Las filas existentes
  // quedan en dirty=1 y se suben en el primer sync.
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((row?.user_version ?? 0) < SCHEMA_VERSION) {
    await addColumnIfMissing(db, 'vaults', 'dirty', 'INTEGER NOT NULL DEFAULT 1');
    await addColumnIfMissing(db, 'items', 'dirty', 'INTEGER NOT NULL DEFAULT 1');
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}

/** Borra todo el cache local (p. ej. al cerrar sesión). */
export async function clearDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM items; DELETE FROM vaults; DELETE FROM sync_meta;');
}
