# `src/lib`

Clientes e integraciones externas.

- `supabase.ts` — cliente de Supabase (Auth + Postgres) para Expo (sesión en AsyncStorage). **Fase 2.**
- `auth.ts` — flujo cero-conocimiento: `register`, `login`, `unlock`, `logout`, `prelogin`. **Fase 2.**
- `biometric.ts` — desbloqueo biométrico con `expo-local-authentication` + secure store. **Fase 2.**
- `passwordStrength.ts` — estimador de fuerza de la contraseña maestra. **Fase 2.**

Ver `docs/adr/0002-cifrado-cero-conocimiento.md` y `docs/adr/0003-sync-supabase.md`.
