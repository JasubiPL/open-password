# `src/store`

Estado global con Zustand.

- `session.ts` — sesión de Supabase y estado de bloqueo (`status` + `unlocked`); acciones
  register/login/unlock/lock/logout. **Fase 2.**
- `vaults.ts` — bóvedas e items descifrados en memoria + CRUD sobre el cache local cifrado
  (`src/db/database.ts`). Define los tipos `Vault`/`VaultItem`. **Fase 3.**
