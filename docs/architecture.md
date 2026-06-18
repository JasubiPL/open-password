# Open Password — Gestor de contraseñas mobile (open source)

## Contexto

Hoy gestionás todas tus contraseñas en un Excel, lo cual es inseguro (texto plano, sin
cifrado, fácil de filtrar) y poco cómodo en el móvil. El objetivo es construir una app
mobile **open source** (licencia MIT, ya presente) que reemplace ese Excel con una bóveda
cifrada, cómoda y multiplataforma.

El repo está vacío salvo el `LICENSE`, así que es un proyecto **desde cero**.

### Decisiones tomadas (con el usuario)
- **Stack:** React Native + **Expo** (TypeScript), un solo código para iOS + Android.
- **Almacenamiento:** Local cifrado **+ sincronización en la nube** vía **Supabase**.
- **Modelo de seguridad:** **Cero-conocimiento** — el servidor solo almacena datos ya
  cifrados con la contraseña maestra; ni el backend ni nadie puede leerlos.
- **Bóvedas ("compartimentos"):** el usuario organiza por contexto (Personal, Familia,
  Proyectos, Trabajo A, Trabajo B). Cada bóveda agrupa entradas.
- **Iconos:** mostrar logos de apps/redes populares en cada entrada.
- **MVP:** bóvedas, import CSV/Excel, generador de contraseñas, desbloqueo biométrico,
  búsqueda y categorías.

---

## Arquitectura de seguridad (el corazón de la app)

Diseño estilo Bitwarden/1Password, **cero-conocimiento**:

1. **Derivación de clave (KDF):** al crear cuenta, el usuario define una *contraseña
   maestra*. Con `Argon2id(masterPassword, salt = userId/email, params)` se deriva la
   **Master Key**. El salt y los parámetros de Argon2 se guardan en el perfil del servidor
   (no son secretos).
2. **Vault Key (clave simétrica):** se genera una clave aleatoria AES-256 (`expo-crypto`).
   Esta clave cifra TODOS los datos. Se guarda en el servidor **cifrada con la Master Key**
   (“protected symmetric key”). Solo se descifra en el dispositivo tras introducir la
   contraseña maestra.
3. **Autenticación:** se deriva un *auth hash* separado
   (`Argon2id`/`PBKDF2(masterKey, masterPassword)`) que se usa como “password” en
   **Supabase Auth**. El servidor nunca ve la contraseña maestra ni la Master Key, solo
   este hash → mantiene el cero-conocimiento usando Supabase Auth estándar.
4. **Cifrado de items:** cada entrada se cifra con `AES-256-GCM` usando la Vault Key. El
   servidor guarda únicamente ciphertext + IV + metadatos no sensibles (timestamps).
5. **En memoria:** la Master Key y la Vault Key viven **solo en RAM** durante la sesión;
   nunca se persisten en claro.
6. **Biometría:** tras el primer desbloqueo, se guarda la Vault Key en
   `expo-secure-store` (Keychain iOS / Keystore Android, con `requireAuthentication`) para
   desbloqueos posteriores con Face ID / huella sin reescribir la contraseña maestra.

**Librerías de cripto (puro JS, auditadas, funcionan en Expo Go — sin build nativo):**
- `@noble/hashes` → `argon2id`, `pbkdf2`, `hkdf`, `sha256`.
- `@noble/ciphers` → `aes-256-gcm`.
- `expo-crypto` → bytes aleatorios seguros (CSPRNG).

---

## Stack técnico

| Área | Elección | Por qué |
|---|---|---|
| Framework | Expo (SDK actual) + Expo Router | Multiplataforma, navegación file-based, corre en Expo Go |
| Lenguaje | TypeScript | Seguridad de tipos en lógica sensible |
| Estado | Zustand | Ligero, ideal para estado de sesión/bóveda |
| DB local | `expo-sqlite` | Cache offline de items cifrados + búsqueda |
| Cripto | `@noble/hashes`, `@noble/ciphers`, `expo-crypto` | Cero-conocimiento sin módulos nativos |
| Seguro | `expo-secure-store`, `expo-local-authentication` | Biometría + almacenamiento de clave |
| Backend | Supabase (`@supabase/supabase-js`) | Postgres + Auth + RLS, open source |
| Iconos UI | `@expo/vector-icons` | Incluido en Expo (Material/Ionicons/Feather). Reemplaza a `react-icons`, que es solo web |
| Logos marca (color) | Colección **"Logos"** (gilbarbara, MIT) + `react-native-svg` + `react-native-svg-transformer` | Logos **a color** de empresas (Google, Microsoft, Facebook…), bundle local/offline |
| Import | `expo-document-picker`, `expo-file-system`, `papaparse` | Leer y parsear CSV |

> **Nota iconos:** `react-icons` NO funciona en React Native (renderiza SVG del DOM web).
> En Expo se usa `@expo/vector-icons` para la UI. Para los **logos de marcas a color** se
> bundlean SVGs full-color (colección "Logos") y se renderizan con `react-native-svg`.
> Fallback: avatar con inicial + color cuando no exista el logo.

> Excel (`.xlsx`) no se parsea directo en RN (pesado). Flujo recomendado: el usuario hace
> **“Guardar como CSV”** en Excel y se importa el CSV. Es el estándar de la industria.

---

## Estructura del proyecto

```
open-password/
├── app/                      # Pantallas (Expo Router)
│   ├── (auth)/               # registro / login con contraseña maestra
│   ├── unlock.tsx            # desbloqueo (maestra o biometría)
│   ├── (tabs)/
│   │   ├── index.tsx         # lista de Bóvedas
│   │   ├── search.tsx        # búsqueda global
│   │   └── settings.tsx
│   ├── vault/[id].tsx        # entradas de una bóveda
│   ├── item/[id].tsx         # ver/editar entrada
│   ├── generator.tsx         # generador de contraseñas
│   └── import.tsx            # importar CSV
├── src/
│   ├── crypto/               # kdf.ts, cipher.ts, keyManager.ts
│   ├── db/                   # sqlite.ts, models.ts, sync.ts
│   ├── lib/supabase.ts
│   ├── store/                # zustand: session, vaults
│   ├── icons/brand.ts        # mapeo dominio/nombre → logo a color (colección "Logos")
│   └── components/
├── assets/brand-logos/       # SVGs full-color de empresas (Google, Microsoft, FB…)
├── assets/branding/          # generados (ya en el repo, de docs/design/brand/)
│   ├── icon.png                  # 1024² OPACO: escudo sobre fondo #0E1116 (iOS/legacy)
│   ├── adaptive-icon.png         # 1024² transparente: escudo en zona segura (foreground Android)
│   ├── splash-icon.png           # 1024² transparente: escudo para el splash
│   ├── logo-horizontal.png       # lockup escudo + wordmark (Acerca de/headers)
│   ├── jasubip-vertical.png      # imagotipo autor (atribución)
│   └── jasubip-horizontal.png    # imagotipo autor (atribución)
├── supabase/migrations/      # schema SQL + RLS
└── README.md                 # docs para contribuidores (open source)
```

> **Plataforma objetivo:** se prueba en **Android** (Expo Go en dispositivo físico).
> **Expo SDK 56** (última versión). iOS soportado pero no es la prioridad de testing.
>
> **Icono y splash (Expo `app.json` / `app.config`):**
> ```jsonc
> {
>   "icon": "./assets/branding/icon.png",
>   "android": {
>     "adaptiveIcon": {
>       "foregroundImage": "./assets/branding/adaptive-icon.png",
>       "backgroundColor": "#0E1116"
>     }
>   },
>   "splash": {                       // o el plugin `expo-splash-screen` en SDK 56
>     "image": "./assets/branding/splash-icon.png",
>     "resizeMode": "contain",
>     "backgroundColor": "#0E1116"
>   }
> }
> ```
> Acento de marca: **teal/cyan** (del logo); fondo oscuro **#0E1116**. Los iconos ya están
> generados (compuestos con ImageMagick desde el escudo transparente).
> ⚠️ El escudo fuente es 500×500 → los iconos se upscalearon. Para máxima nitidez, exportar
> una versión del escudo transparente ≥1024² y regenerar. Assets fuente en `docs/design/brand/`.

---

## Modelo de datos (Supabase / Postgres)

Todas las tablas con **RLS** filtrando por `user_id = auth.uid()`.

- **`profiles`**: `user_id` (PK, ref auth.users), `kdf_salt`, `kdf_params` (jsonb),
  `protected_vault_key` (Vault Key cifrada con Master Key), `created_at`.
- **`vaults`** (las "Bóvedas"): `id`, `user_id`, `name_enc`, `icon`, `color`, `order`,
  `updated_at`, `deleted` (soft delete para sync).
- **`items`**: `id`, `vault_id`, `user_id`, `data_enc` (ciphertext de
  `{title, username, password, url, notes, category, brandIcon}`), `iv`, `updated_at`,
  `deleted`.

Sync: pull/push por `updated_at`, last-write-wins, con soft-delete (`deleted`) para
propagar borrados. El cache local (`expo-sqlite`) guarda el ciphertext para uso offline;
el descifrado y la búsqueda ocurren en memoria en el dispositivo (obligatorio por ser
cero-conocimiento — el server no puede buscar dentro del texto cifrado).

---

## Plan de implementación (por fases)

### Fase 0 — Scaffolding ✅ (hecho)
- Proyecto Expo en **SDK 56** (última versión): `expo` 56.0.12, `react-native` 0.85.3,
  `react` 19.2, TypeScript 6.0, con **Expo Router** (app dir en `src/app`).
- `app.json` cableado con la marca: `icon`/`adaptiveIcon`/`splash` → `assets/branding/*`,
  fondo `#0E1116`, acento teal. Estructura `src/` del plan creada (crypto, db, lib, store,
  icons, components) con README por carpeta.
- `.npmrc` con `legacy-peer-deps=true` (instala limpio). Pantalla inicial mínima con el
  logo. Verificado: `tsc` OK, `expo-doctor` 21/21, bundle Android OK.
- Pendiente menor: lint (ESLint/Prettier) y revisar fonts material-symbols que entran al
  bundle (~5MB) por defecto.

### Fase 1 — Núcleo de cripto (`src/crypto/`) ✅ (hecho)
- `kdf.ts`: `deriveMasterKey`/`deriveMasterKeyAsync` (Argon2id, ~8 MiB/2 pasadas — coste
  bajo a propósito porque el JS puro bloquea el hilo de RN; ver nota en ADR 0002) y
  `deriveAuthHash` (PBKDF2) +
  `generateSalt`.
- `cipher.ts`: `encrypt`/`decrypt` de bytes y string con AES-256-GCM (+ IV aleatorio de
  12 bytes y AAD opcional); formato serializado `base64(iv || ciphertext+tag)`.
- `keyManager.ts`: generar/envolver/desenvolver la Vault Key, mantenerla en RAM e
  integrar `expo-secure-store` (biometría).
- `encoding.ts` (base64/utf8/hex) y `random.ts` (CSPRNG `expo-crypto`) de apoyo.
- **Tests unitarios** (18) con Jest: round-trip cifrar→descifrar, derivación determinista,
  autenticación GCM y manejo de la Vault Key. Verificado: `npm test`, `tsc` OK,
  expo-doctor 21/21.

### Fase 2 — Auth + onboarding ✅ (hecho)
- **Cliente Supabase** (`src/lib/supabase.ts`) con sesión persistida en AsyncStorage
  (`react-native-url-polyfill`); env `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` (`.env.example`).
- **Servicio de auth** (`src/lib/auth.ts`): `register` (signUp con auth hash + perfil cifrado),
  `login` (prelogin RPC → derivar → autenticar → desenvolver), `unlock` (re-deriva con la
  maestra y desenvuelve), `logout`.
- **Store de sesión** (`src/store/session.ts`, Zustand): ejes `status` (sesión) y `unlocked`
  (Vault Key en RAM); bootstrap + suscripción a `onAuthStateChange`.
- **Biometría** (`src/lib/biometric.ts`, `expo-local-authentication` + secure store). El
  enrolamiento (`syncBiometricEnrollment`) guarda la Vault Key en el secure store
  (`requireAuthentication`) tras un desbloqueo con contraseña; la pantalla de unlock solo
  ofrece el botón si está realmente habilitado (`isBiometricEnabled`), y el desbloqueo lee la
  clave directo del keychain (un único prompt del SO, sin doble autenticación).
- **Migraciones** `supabase/migrations/`: `0001_profiles.sql` (tabla `profiles` salt +
  `protected_vault_key`, RLS por `auth.uid()`, RPC `get_salt_by_email`; salt no es secreto,
  permite enumeración — aceptado para el MVP, estilo Bitwarden) y
  `0002_prelogin_metadata_fallback.sql` (el prelogin lee el salt también de `user_metadata`).
- **Confirmación de email:** el registro guarda `salt` + Vault Key cifrada en `user_metadata`,
  así sobreviven si el proyecto exige confirmar; el perfil se materializa en el primer login.
  `register` devuelve `'unlocked'` o `'emailConfirmationRequired'`.
- **Pantallas** (Expo Router): `onboarding`, `register` (medidor de fuerza + aviso de
  no-recuperación), `verify-email` (cuando hay que confirmar; con reenvío), `login`,
  `unlock` (maestra + biometría), placeholder `vaults` y guards por grupo (`(auth)`/`(app)`).
  Operaciones con KDF muestran un `LoadingOverlay` (el hilo de JS se bloquea; ver ADR 0002).
- **Tests** (Jest): orquestación register→login→unlock recupera la misma Vault Key, fallos
  con contraseña/email incorrectos, y medidor de fuerza. `configureArgon2Params` permite
  acelerar Argon2 en tests. Verificado: `npm test` 26/26, `tsc` OK, expo-doctor 21/21.
- **Verificación E2E ✅:** `src/lib/__tests__/auth.e2e.test.ts` corre register→login→unlock
  contra el Supabase real (cripto + Auth + RLS + RPC prelogin), validando que se recupera la
  misma Vault Key y que la contraseña incorrecta falla. Es opt-in (`npm run test:e2e`,
  `RUN_E2E=1`) para no crear usuarios en cada `npm test`; requiere "Confirm email" desactivado.
  Conectividad/RLS: `npm run check:supabase`.

### Fase 3 — Bóvedas e items (CRUD local + cifrado) ✅ (hecho)
- **Cache local** (`src/db/database.ts`, `expo-sqlite`): tablas `vaults`/`items` con solo
  ciphertext + metadatos (timestamps, `vault_id`, flag `deleted` para la Fase 4).
- **Cifrado de registros** (`src/lib/vaultCrypto.ts`): cada registro se serializa a JSON y se
  cifra con la Vault Key (AES-256-GCM); se descifra en memoria.
- **Store Zustand** (`src/store/vaults.ts`): bóvedas/items descifrados en RAM, CRUD que
  persiste ciphertext; init/carga al desbloquear, limpieza en lock/logout.
- **Pantallas**: lista de bóvedas (con FAB y estado vacío), crear/editar/borrar bóveda
  (selector de color e icono con `@expo/vector-icons`), detalle de bóveda con **búsqueda en
  memoria**, crear/editar/borrar entrada, y detalle de entrada con mostrar/ocultar
  contraseña, abrir URL y **copiar con auto-limpieza** del portapapeles (`expo-clipboard`).
- **Catálogo de plataformas** (`src/constants/platforms.ts`): apps comunes (Google, Outlook,
  Instagram…) con icono de marca a color (FontAwesome6 brands) y URL; al elegir una se
  autocompleta la URL/título, u opción "Personalizada". Logos full-color (gradientes) → Fase 5.
- **Login/unlock más rápidos:** la Vault Key envuelta viaja en `user_metadata`, así el login
  evita una llamada extra a `profiles` y el **unlock es offline** (lee la sesión local; solo
  cuesta Argon2id).
- **Tests** (Jest): round-trip de `vaultCrypto`. Verificado: `npm test` 32/32, `tsc` OK,
  expo-doctor 21/21.
- Nota: persistencia **solo local** (sin sync). La sincronización con Supabase es la Fase 4.

### Fase 4 — Sync con Supabase 🚧 (en progreso)
- **Migración** `0003_vaults_items.sql`: tablas `vaults`/`items` que **espejan el cache local**
  (solo blob cifrado `data` + metadatos: ids, timestamps en ms del cliente, flag `deleted`),
  con RLS por `auth.uid()` (select/insert/update/delete propios) e índices `(user_id, updated_at)`.
  Sin columnas en claro (icon/color/etc. van dentro del blob → más cero-conocimiento que el
  plan original).
- **Esquema local** (`src/db/database.ts`): columna `dirty` (cambios pendientes de subir) y
  tabla `sync_meta` (cursor de pull por tabla); migración versionada (`PRAGMA user_version`)
  para installs de Fase 3.
- **`src/lib/sync.ts`** (`syncNow`): **push** de filas `dirty` vía upsert (luego las marca
  limpias) + **pull** incremental por `updated_at > cursor` con **last-writer-wins** por fila
  (la remota gana solo si es estrictamente más nueva) y propagación de soft-deletes. No-op sin
  sesión (offline-first). Conflicto a nivel de fila (el registro es un blob opaco).
- **Wiring**: `useVaults.sync()` (push+pull, recarga solo si el pull trajo cambios) se llama al
  desbloquear tras el `load` local; cada mutación dispara un push en segundo plano.
- **Tests** (Jest): `sync.test.ts` (6) con SQLite + Supabase en memoria cubre push, pull, LWW
  (ambos sentidos), soft-delete y sin-sesión.
- Trade-off: `updated_at` es reloj del cliente (posible skew entre dispositivos, aceptado para
  el MVP). Realtime y reconciliación automática de cambios remotos en vivo → futuro.
- ⚠️ Requiere aplicar `0003` al proyecto Supabase (`supabase db push` o el SQL editor) antes
  de probar el sync end-to-end.

### Fase 5 — Funcionalidades MVP restantes
- **Generador** (`generator.tsx`): longitud, mayúsc/minúsc/números/símbolos, usando
  `expo-crypto` para aleatoriedad. Indicador de fuerza.
- **Iconos de UI**: usar `@expo/vector-icons` en toda la app (no `react-icons`).
- **Logos de marca a color** (`src/icons/brand.ts`): bundlear SVGs full-color (colección
  "Logos") en `assets/brand-logos/`, mapear por dominio/nombre y renderizar con
  `react-native-svg` (vía `react-native-svg-transformer`); fallback a avatar inicial + color.
- **Import CSV** (`import.tsx`): elegir archivo, parsear con `papaparse`, mapear columnas
  (sitio/usuario/contraseña/notas), previsualizar y asignar a una bóveda. Guía para
  exportar el Excel a CSV.
- **Marca / atribución JasubiP** (ver `docs/design/screens.md` → "Marca y atribución"):
  - Copiar los imagotipos de `docs/design/brand/` a `assets/branding/`. Son versiones **en
    blanco** → usar sobre fondo oscuro/acento (pendiente exportar variante para fondos
    claros).
  - **Splash:** imagotipo **vertical** + leyenda corta *"JasubiP® 2015–2026"*.
  - **Acerca de** (`settings/about.tsx`): imagotipo **horizontal** + bloque de autoría +
    leyenda completa *"JasubiP® — Marca registrada 2015–2026. Todos los derechos
    reservados."* + link al repo + licencia MIT.
  - Firma discreta *"JasubiP® 2015–2026"* en Login, Desbloqueo y pie de Ajustes. Componente
    reutilizable `BrandSignature`.

### Fase 6 — Pulido
- Auto-lock por inactividad, ocultar contraseñas por defecto, bloquear screenshots en
  pantallas sensibles. Tema claro/oscuro. README final + capturas para el repo público.

---

## Reutilización / referencias
- Proyecto greenfield: no hay código previo que reutilizar.
- Se aprovecha la skill **supabase** del entorno para los patrones de cliente SSR/Auth y
  las políticas **RLS** (clave para aislar datos por usuario).
- Los **logos de marca a color** (colección "Logos") se bundlean localmente, evitando
  depender de APIs externas de favicons (mejor para privacidad y uso offline, coherente con
  el modelo cero-conocimiento). `@expo/vector-icons` cubre los iconos de UI.

---

## Verificación (end-to-end)
1. `npx expo start` y abrir en **Expo Go** (todas las libs del MVP son compatibles) o en
   un simulador.
2. **Tests de cripto:** `npm test` — round-trip cifrar/descifrar, derivación de claves
   determinista, que `data_enc` nunca contenga texto plano.
3. **Flujo manual:**
   - Registrar cuenta con contraseña maestra → cerrar y reabrir → desbloquear con maestra
     y luego con biometría.
   - Crear las bóvedas (Personal, Familia, Trabajo A/B, Proyectos), añadir entradas con
     icono de marca, buscar y filtrar.
   - Generar una contraseña y guardarla en una entrada.
   - Exportar el Excel a CSV e importarlo a una bóveda; verificar el mapeo.
4. **Verificar cero-conocimiento:** inspeccionar las filas en Supabase (dashboard/SQL) y
   confirmar que `data_enc`/`name_enc` son ciphertext ilegibles; comprobar que las
   políticas RLS impiden leer filas de otro `user_id`.
5. Sync: crear una entrada en un dispositivo/sesión y verificar que aparece tras pull en
   otra sesión del mismo usuario.
6. **Marca/atribución:** verificar que el imagotipo vertical se ve en el Splash y el
   horizontal en "Acerca de" (sobre fondo oscuro/acento), y que la leyenda *"JasubiP® —
   Marca registrada 2015–2026"* aparece completa en "Acerca de" y abreviada en las firmas
   discretas. Confirmar que el aviso de copyright MIT se conserva en el código.

---

## Fuera de alcance (futuro)
- Autofill nativo del sistema (requiere dev build + módulos nativos por plataforma).
- Compartir bóvedas entre usuarios, 2FA/TOTP integrado, recuperación de cuenta, watchtower
  de contraseñas filtradas. Se pueden añadir tras el MVP.
