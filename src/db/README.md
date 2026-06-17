# `src/db`

Persistencia local y sincronización. Pendiente — **Fases 3 y 4**.

- `sqlite.ts` — cache local cifrado (`expo-sqlite`).
- `models.ts` — tipos de bóvedas e items.
- `sync.ts` — push/pull incremental con Supabase por `updated_at`.

Ver `docs/adr/0003-sync-supabase.md`.
