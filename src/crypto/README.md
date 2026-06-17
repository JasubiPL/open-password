# `src/crypto`

Núcleo de criptografía (cero-conocimiento). Pendiente — **Fase 1**.

- `kdf.ts` — derivar Master Key (Argon2id) y auth hash.
- `cipher.ts` — `encrypt`/`decrypt` con AES-256-GCM (+ IV aleatorio).
- `keyManager.ts` — generar/abrir Vault Key, mantenerla en RAM, `expo-secure-store`.

Ver `docs/adr/0002-cifrado-cero-conocimiento.md`.
