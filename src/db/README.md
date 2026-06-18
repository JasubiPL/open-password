# `src/db`

Persistencia local y sincronización.

- `database.ts` — cache local con `expo-sqlite` (tablas `vaults`/`items` con solo
  ciphertext + metadatos; `getDb`, `initDatabase`, `clearDatabase`). **Fase 3.**
- `sync.ts` — push/pull incremental con Supabase por `updated_at`. Pendiente — **Fase 4.**

El cifrado/descifrado de registros vive en `src/lib/vaultCrypto.ts`; los tipos de
bóvedas e items en `src/store/vaults.ts`. Ver `docs/adr/0003-sync-supabase.md`.
