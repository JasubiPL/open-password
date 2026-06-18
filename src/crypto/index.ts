/**
 * Núcleo de criptografía cero-conocimiento (Fase 1). Ver ADR 0002.
 *
 * Flujo de alto nivel:
 *   1. Registro: generar salt → masterKey = deriveMasterKey(pw, salt);
 *      vaultKey = generateVaultKey(); guardar protectVaultKey(vaultKey, masterKey)
 *      y deriveAuthHash(masterKey, pw) en el servidor.
 *   2. Desbloqueo: masterKey = deriveMasterKey(pw, salt);
 *      vaultKey = unprotectVaultKey(protected, masterKey); setVaultKey(vaultKey).
 *   3. Uso: encryptString/decryptString con getVaultKey().
 */
export * from './kdf';
export * from './cipher';
export * from './keyManager';
export * from './encoding';
export { randomBytes } from './random';
