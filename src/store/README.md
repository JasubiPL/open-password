# `src/store`

Estado global con Zustand.

- `session.ts` — sesión de Supabase y estado de bloqueo (`status` + `unlocked`); acciones
  register/login/unlock/lock/logout. **Fase 2.**
- `vaults.ts` — bóvedas e items descifrados en memoria. Pendiente — **Fase 3.**
