/**
 * Tests del motor de sincronización (Fase 4).
 *
 * Mockeamos SQLite (cache local) y Supabase (servidor) en memoria para validar
 * la lógica de push/pull, last-writer-wins y soft-deletes sin dependencias
 * nativas ni red. Los nombres llevan prefijo `mock` porque las factories de
 * `jest.mock` solo pueden referenciar variables así.
 */

// --- Fake SQLite local ------------------------------------------------------
interface Row {
  id: string;
  vault_id?: string;
  data: string;
  created_at: number;
  updated_at: number;
  deleted: number;
  dirty: number;
}

const mockLocal = {
  vaults: new Map<string, Row>(),
  items: new Map<string, Row>(),
  meta: new Map<string, string>(),
};

const mockDb = {
  getAllAsync: async (sql: string): Promise<Row[]> => {
    if (sql.includes('FROM vaults WHERE dirty = 1')) {
      return [...mockLocal.vaults.values()].filter((r) => r.dirty === 1);
    }
    if (sql.includes('FROM items WHERE dirty = 1')) {
      return [...mockLocal.items.values()].filter((r) => r.dirty === 1);
    }
    return [];
  },
  getFirstAsync: async (sql: string, params: unknown[] = []): Promise<unknown> => {
    if (sql.includes('FROM sync_meta')) {
      const v = mockLocal.meta.get(params[0] as string);
      return v !== undefined ? { value: v } : null;
    }
    if (sql.includes('FROM vaults WHERE id')) {
      const r = mockLocal.vaults.get(params[0] as string);
      return r ? { updated_at: r.updated_at } : null;
    }
    if (sql.includes('FROM items WHERE id')) {
      const r = mockLocal.items.get(params[0] as string);
      return r ? { updated_at: r.updated_at } : null;
    }
    return null;
  },
  runAsync: async (sql: string, params: unknown[] = []): Promise<void> => {
    if (sql.includes('INSERT INTO sync_meta')) {
      mockLocal.meta.set(params[0] as string, params[1] as string);
    } else if (sql.startsWith('UPDATE vaults SET dirty = 0')) {
      const r = mockLocal.vaults.get(params[0] as string);
      if (r && r.updated_at === params[1]) r.dirty = 0;
    } else if (sql.startsWith('UPDATE items SET dirty = 0')) {
      const r = mockLocal.items.get(params[0] as string);
      if (r && r.updated_at === params[1]) r.dirty = 0;
    } else if (sql.includes('INSERT INTO vaults')) {
      const [id, data, created_at, updated_at, deleted] = params as [string, string, number, number, number];
      mockLocal.vaults.set(id, { id, data, created_at, updated_at, deleted, dirty: 0 });
    } else if (sql.includes('INSERT INTO items')) {
      const [id, vault_id, data, created_at, updated_at, deleted] = params as [
        string, string, string, number, number, number,
      ];
      mockLocal.items.set(id, { id, vault_id, data, created_at, updated_at, deleted, dirty: 0 });
    }
  },
};

// --- Fake Supabase server ---------------------------------------------------
interface ServerRow {
  id: string;
  user_id: string;
  vault_id?: string;
  data: string;
  created_at: number;
  updated_at: number;
  deleted: boolean;
}

const mockServer = {
  vaults: new Map<string, ServerRow>(),
  items: new Map<string, ServerRow>(),
};
let mockHasSession = true;

jest.mock('@/db/database', () => ({ getDb: async () => mockDb }));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: mockHasSession ? { user: { id: 'user-1' } } : null } }),
    },
    from: (table: 'vaults' | 'items') => ({
      upsert: async (rows: ServerRow[]) => {
        for (const r of rows) mockServer[table].set(r.id, { ...r });
        return { error: null };
      },
      select: () => ({
        gt: (_col: string, value: number) => ({
          order: async () => ({
            data: [...mockServer[table].values()].filter((r) => r.updated_at > value),
            error: null,
          }),
        }),
      }),
    }),
  },
}));

import { syncNow } from '../sync';

function seedLocalVault(r: Partial<Row> & { id: string }): void {
  mockLocal.vaults.set(r.id, {
    data: 'enc', created_at: 1, updated_at: 1, deleted: 0, dirty: 1, ...r,
  });
}

beforeEach(() => {
  mockLocal.vaults.clear();
  mockLocal.items.clear();
  mockLocal.meta.clear();
  mockServer.vaults.clear();
  mockServer.items.clear();
  mockHasSession = true;
});

describe('syncNow', () => {
  it('sube las filas locales sucias y las marca limpias', async () => {
    seedLocalVault({ id: 'v1', updated_at: 100 });
    mockLocal.items.set('i1', { id: 'i1', vault_id: 'v1', data: 'enc', created_at: 1, updated_at: 100, deleted: 0, dirty: 1 });

    const result = await syncNow();

    expect(result).toMatchObject({ pushed: 2, skipped: false });
    expect(mockServer.vaults.get('v1')).toMatchObject({ id: 'v1', user_id: 'user-1', deleted: false });
    expect(mockServer.items.get('i1')).toMatchObject({ vault_id: 'v1' });
    expect(mockLocal.vaults.get('v1')!.dirty).toBe(0);
    expect(mockLocal.items.get('i1')!.dirty).toBe(0);
    expect(mockLocal.meta.get('cursor_vaults')).toBe('100'); // cursor avanzó
  });

  it('baja filas remotas nuevas y avanza el cursor', async () => {
    mockServer.vaults.set('v2', {
      id: 'v2', user_id: 'user-1', data: 'remote', created_at: 5, updated_at: 200, deleted: false,
    });

    const result = await syncNow();

    expect(result.pulled).toBe(1);
    expect(mockLocal.vaults.get('v2')).toMatchObject({ data: 'remote', updated_at: 200, dirty: 0 });
    expect(mockLocal.meta.get('cursor_vaults')).toBe('200');
  });

  it('last-writer-wins: una remota más vieja NO pisa la local más nueva', async () => {
    seedLocalVault({ id: 'v1', data: 'local-new', updated_at: 300, dirty: 0 });
    mockServer.vaults.set('v1', {
      id: 'v1', user_id: 'user-1', data: 'remote-old', created_at: 1, updated_at: 100, deleted: false,
    });

    await syncNow();

    expect(mockLocal.vaults.get('v1')!.data).toBe('local-new');
  });

  it('last-writer-wins: una remota más nueva pisa la local', async () => {
    seedLocalVault({ id: 'v1', data: 'local-old', updated_at: 100, dirty: 0 });
    mockServer.vaults.set('v1', {
      id: 'v1', user_id: 'user-1', data: 'remote-new', created_at: 1, updated_at: 400, deleted: false,
    });

    await syncNow();

    expect(mockLocal.vaults.get('v1')).toMatchObject({ data: 'remote-new', updated_at: 400 });
  });

  it('propaga soft-deletes remotos', async () => {
    seedLocalVault({ id: 'v1', updated_at: 100, dirty: 0 });
    mockServer.vaults.set('v1', {
      id: 'v1', user_id: 'user-1', data: 'enc', created_at: 1, updated_at: 500, deleted: true,
    });

    await syncNow();

    expect(mockLocal.vaults.get('v1')!.deleted).toBe(1);
  });

  it('no hace nada sin sesión', async () => {
    mockHasSession = false;
    seedLocalVault({ id: 'v1', updated_at: 100 });

    const result = await syncNow();

    expect(result).toEqual({ pushed: 0, pulled: 0, skipped: true });
    expect(mockServer.vaults.size).toBe(0);
  });
});
