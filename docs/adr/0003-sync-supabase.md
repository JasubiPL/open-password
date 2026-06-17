# ADR 0003 — Sincronización con Supabase

- **Estado:** Aceptada
- **Fecha:** 2026-06-17

## Contexto
El usuario quiere acceder a sus bóvedas desde varios dispositivos, así que necesitamos
sincronización en la nube. Debe ser compatible con el modelo cero-conocimiento
(ver [ADR 0002](0002-cifrado-cero-conocimiento.md)) y, idealmente, open source.

## Decisión
Usar **Supabase** (Postgres + Auth + Row Level Security):

- **Auth** con el *auth hash* derivado (no la contraseña maestra).
- Tablas `profiles`, `vaults`, `items` que almacenan **solo ciphertext** + metadatos no
  sensibles (timestamps).
- **RLS** en todas las tablas filtrando por `user_id = auth.uid()` para aislar datos por
  usuario.
- Sincronización **pull/push incremental** por `updated_at`, *last-write-wins*, con
  *soft-delete* (`deleted`) para propagar borrados. Cache local en `expo-sqlite` para uso
  offline.

## Consecuencias
- ✅ Backend open source, con plan gratuito y RLS para aislamiento de datos.
- ✅ Compatible con cero-conocimiento: el server guarda datos ilegibles.
- ✅ Funciona offline (cache local) y sincroniza al reconectar.
- ⚠️ Hay que diseñar bien las políticas RLS y testearlas (un fallo expondría datos entre
  usuarios, aunque cifrados).
- ⚠️ Resolución de conflictos simple (last-write-wins); casos avanzados quedan para después.
