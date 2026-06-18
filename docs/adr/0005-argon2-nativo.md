# ADR 0005 — Argon2id nativo para builds de producción

- **Estado:** Aceptada
- **Fecha:** 2026-06-18

## Contexto
La Master Key se deriva con **Argon2id** (ver [ADR 0002](0002-cifrado-cero-conocimiento.md)).
En Expo Go solo corre la implementación en **JS puro** (`@noble/hashes`), que en Hermes (sin
JIT) es muy lenta: con 8 MiB / 2 pasadas el login/unlock por contraseña tardaba ~30 s. Para
que fuera usable bajamos el coste por defecto a ~2 MiB / 1 pasada
([per-user params](../architecture.md)), por debajo del mínimo OWASP (~19 MiB).

Queremos recuperar parámetros fuertes **sin penalizar la UX**. Argon2id nativo (C) es ~50–200×
más rápido que el JS interpretado, pero no existe en Expo Go: requiere un **build nativo**
(dev client o build de EAS).

## Decisión
1. **Parámetros por usuario** (ya implementado): cada cuenta guarda sus `kdf_params`; el
   prelogin los devuelve. Esto permite cambiar los defaults sin romper cuentas existentes.
2. **Punto de integración nativo seguro** en `src/crypto/kdf.ts`:
   - `registerNativeArgon2(fn)` registra un Argon2id nativo.
   - Antes de usarlo se **valida** contra `@noble` con un vector de prueba (`nativeIsTrustworthy`).
     Argon2id es un estándar: un módulo correcto produce **bytes idénticos** para los mismos
     inputs y parámetros (misma versión 0x13, sin secret/AAD). Si no coincide (p. ej. el módulo
     codifica el salt distinto), se **descarta** y se usa el JS de `@noble`.
   - Garantía: **nunca** se puede bloquear a un usuario por un nativo incompatible — el peor caso
     es el comportamiento actual (JS).
3. **Build de producción** vía EAS (ver `eas.json`): perfiles `development` (dev client),
   `preview` (APK interno) y `production` (AAB / store).
4. Con el nativo validado, `DEFAULT_ARGON2_PARAMS` puede pasar a `STRONG_ARGON2_PARAMS`
   (~64 MiB / 3 pasadas) **para cuentas nuevas** (las viejas siguen con los suyos).

### Cómo enchufar un módulo nativo
Elegir un paquete de Argon2 nativo que acepte el **salt como bytes** (hex/base64), no como
string UTF-8 — si solo acepta string, el salt aleatorio no round-trippea y el self-test fallará
(cayendo a JS). En el arranque de la app (build nativo), adaptar su API a `NativeArgon2` y
registrarlo:

```ts
// p. ej. en src/app/_layout.tsx, solo en builds nativos
import argon2 from 'react-native-argon2'; // o el paquete elegido
import { registerNativeArgon2 } from '@/crypto';
import { bytesToHex, base64ToBytes } from '@/crypto';

registerNativeArgon2(async (pw, salt, params) => {
  const res = await argon2(/* utf8 */ new TextDecoder().decode(pw), bytesToHex(salt), {
    mode: 'argon2id', iterations: params.t, memory: params.m, parallelism: params.p,
    hashLength: params.dkLen, /* saltIsHex: true según el paquete */
  });
  return base64ToBytes(/* el paquete suele dar hex */ res.rawHash);
});
```

El self-test decide si se usa: si los bytes no cuadran con `@noble`, se ignora sin riesgo.

## Consecuencias
- ✅ Camino claro a parámetros OWASP+ sin penalizar la UX, en builds nativos.
- ✅ Cero riesgo de lockout: validación contra `@noble` + fallback.
- ✅ Sigue corriendo en Expo Go (JS) para desarrollo.
- ⚠️ Para activarlo hay que: agregar el paquete nativo, registrarlo, verificar en dispositivo
  que el self-test pasa, y recién entonces subir `DEFAULT_ARGON2_PARAMS`.
- ⚠️ La app deja de correr en Expo Go una vez que el paquete nativo es obligatorio; el flujo de
  dev pasa a **dev client**.
