# ADR 0002 — Cifrado cero-conocimiento

- **Estado:** Aceptada
- **Fecha:** 2026-06-17

## Contexto
Es un gestor de contraseñas: la confidencialidad es el requisito central. Aunque se
sincroniza en la nube (ver [ADR 0003](0003-sync-supabase.md)), el servidor **no debe poder
leer** las contraseñas del usuario.

## Decisión
Adoptar un modelo **cero-conocimiento**, estilo Bitwarden/1Password:

1. **Master Key** derivada de la contraseña maestra con **Argon2id** (salt por usuario).
2. **Vault Key** aleatoria (AES-256) que cifra todos los datos; se guarda en el servidor
   **cifrada con la Master Key**.
3. **Auth hash** separado (derivado) usado como "password" en Supabase Auth → el servidor
   nunca ve la contraseña maestra ni la Master Key.
4. Items cifrados con **AES-256-GCM**; el servidor solo almacena ciphertext + IV + metadatos.
5. Master Key y Vault Key viven **solo en RAM**; opción de desbloqueo biométrico guardando
   la Vault Key en `expo-secure-store`.

Librerías (JS puro, auditadas, compatibles con Expo Go): `@noble/hashes` (argon2id,
pbkdf2, hkdf), `@noble/ciphers` (aes-256-gcm), `expo-crypto` (CSPRNG).

## Consecuencias
- ✅ Ni el backend ni un atacante con acceso a la base pueden leer las contraseñas.
- ✅ Sin módulos nativos de cripto → corre en Expo Go.
- ⚠️ **No hay recuperación de cuenta**: si el usuario olvida la contraseña maestra, los
  datos no se pueden descifrar. Hay que comunicarlo claramente en el onboarding.
- ⚠️ La búsqueda debe hacerse en memoria en el dispositivo (el servidor no puede buscar
  dentro del texto cifrado).
- ⚠️ Argon2id en JS puro es más lento; aceptable porque solo corre al desbloquear.
- ⚠️ **JS puro bloquea el único hilo de JS de RN.** Argon2id no puede correr fuera del
  hilo en Expo Go (no hay workers; el `argon2idAsync` de noble cede con microtasks, que no
  devuelven control a RN). Mitigación actual: coste bajo (~8 MiB / 2 pasadas) para que el
  bloqueo sea corto + un overlay modal durante el cálculo (el spinner nativo sigue animando)
  y un `yieldToUI()` para pintarlo antes. Para subir el coste a niveles OWASP sin congelar
  la UI hará falta un **dev build con Argon2 nativo** (revisar este ADR), guardando los
  parámetros por usuario en `profiles` para no invalidar cuentas existentes.
