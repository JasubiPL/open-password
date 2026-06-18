# `src/crypto`

Núcleo de criptografía (cero-conocimiento). **Fase 1 — implementada.** ✅

- `kdf.ts` — `deriveMasterKey` (Argon2id) y `deriveAuthHash` (PBKDF2), más `generateSalt`.
- `cipher.ts` — `encrypt/decrypt` (bytes y string) con AES-256-GCM + IV aleatorio y AAD opcional.
- `keyManager.ts` — generar/envolver/desenvolver la Vault Key, mantenerla en RAM y
  persistirla para biometría con `expo-secure-store`.
- `encoding.ts` — helpers base64/utf8/hex independientes de plataforma.
- `random.ts` — CSPRNG único (`expo-crypto`), aislado para poder mockearlo en tests.
- `index.ts` — barrel + descripción del flujo de alto nivel (registro/desbloqueo/uso).

Tests en `__tests__/` (round-trip cifrar→descifrar, derivación determinista, autenticación
GCM, manejo de la Vault Key). Ejecutar con `npm test`.

Librerías: `@noble/hashes` (argon2id, pbkdf2), `@noble/ciphers` (aes-256-gcm), `expo-crypto`
(CSPRNG), `expo-secure-store` (biometría). Ver `docs/adr/0002-cifrado-cero-conocimiento.md`.
