# Open Password — Especificación de pantallas (UI/UX)

Documento para diseño. Describe cada pantalla de la app: propósito, contenido, componentes,
estados e interacciones. App mobile (iOS + Android), gestor de contraseñas con bóvedas,
cifrado cero-conocimiento, desbloqueo biométrico, generador, import CSV e iconos de marca.

## Principios de diseño
- **Mobile-first**, vertical. Touch targets ≥ 44px.
- **Seguridad visible pero no intrusiva:** contraseñas ocultas por defecto (•••), botón
  mostrar/ocultar, feedback al copiar, candado/auto-lock.
- **Tema claro y oscuro** desde el día uno.
- **Identidad de marca:** acento sobrio (azul/teal), tipografía legible, iconos de apps
  reales (Google, GitHub, Instagram…) en cada entrada para reconocimiento rápido.
- **Accesible:** contraste AA, soporte de lector de pantalla, tamaños de fuente dinámicos.

---

## Mapa de navegación (flujo)

```
[Splash]
   │
   ├── (sin cuenta) → [Onboarding] → [Crear cuenta / Contraseña maestra] ─┐
   │                                                                       │
   └── (con cuenta) → [Desbloqueo: maestra / biometría] ──────────────────┤
                                                                           ▼
                                                              ┌──── App (tabs) ────┐
                                                              │  • Bóvedas (home)  │
                                                              │  • Buscar          │
                                                              │  • Generador       │
                                                              │  • Ajustes         │
                                                              └────────────────────┘
        Bóvedas → [Detalle de bóveda] → [Detalle de entrada] → [Editar entrada]
        Bóvedas → [Crear/Editar bóveda]
        Ajustes → [Importar CSV] · [Seguridad] · [Apariencia] · [Acerca de]
```

---

## 1. Splash / Carga
- **Propósito:** arranque, decide a dónde ir (onboarding / desbloqueo / app).
- **Contenido:** **icono/logo de la app** (el escudo Open Password,
  `assets/branding/splash-icon.png`) centrado sobre **fondo oscuro `#0E1116`** — es la
  convención: el splash muestra la marca del producto. Opcional: nombre "Open Password" e
  indicador de carga sutil. Al pie, **crédito discreto del autor** *"JasubiP® 2015–2026"*.
- **Config Expo (SDK 56):** `expo-splash-screen` → `image: ./assets/branding/splash-icon.png`,
  `resizeMode: "contain"`, `backgroundColor: "#0E1116"`.
- **Estados:** cargando. Sin interacción.

## 2. Onboarding (primer uso)
- **Propósito:** explicar el valor en 3 slides antes de crear cuenta.
- **Contenido:** carrusel de 3 tarjetas:
  1. "Tus contraseñas, cifradas y solo tuyas" (cero-conocimiento).
  2. "Organizá en bóvedas: Personal, Familia, Trabajo, Proyectos".
  3. "Importá tu Excel y desbloqueá con tu huella/Face ID".
- **Componentes:** ilustración/icono por slide, dots de paginación, botón **Empezar**,
  link "Ya tengo cuenta".
- **Estados:** slide activo. CTA siempre visible.

## 3. Crear cuenta + Contraseña maestra
- **Propósito:** registro y definición de la contraseña maestra (la llave de todo).
- **Contenido:**
  - Campo email.
  - Campo **contraseña maestra** + confirmar, con toggle mostrar/ocultar.
  - **Medidor de fuerza** en vivo (débil/media/fuerte).
  - Aviso destacado: *"Si olvidás tu contraseña maestra no hay forma de recuperarla. No
    la guardamos."* (checkbox de confirmación).
  - Botón **Crear bóveda**.
- **Estados:** vacío, escribiendo, contraseñas no coinciden (error inline), fuerza
  insuficiente, cargando (creando cuenta).

## 4. Login / Iniciar sesión (cuenta existente, dispositivo nuevo)
- **Propósito:** acceder en otro dispositivo.
- **Contenido:** email + contraseña maestra, botón **Entrar**, link "¿Crear cuenta?".
- **Estados:** error de credenciales, cargando.

## 5. Desbloqueo (lock screen)
- **Propósito:** desbloquear la bóveda en cada apertura/auto-lock (cuenta ya en el
  dispositivo).
- **Contenido:**
  - Logo + email enmascarado.
  - Campo contraseña maestra.
  - **Botón biométrico grande** (Face ID / huella) si está habilitado.
  - Link "Usar otra cuenta / Cerrar sesión".
- **Estados:** esperando biometría, error (contraseña incorrecta, con contador de
  intentos), desbloqueando.

## 6. Bóvedas — Home (tab 1)
- **Propósito:** pantalla principal; lista de bóvedas (los "compartimentos").
- **Contenido:**
  - Header con título "Bóvedas" + avatar/ajustes.
  - **Grid o lista de tarjetas de bóveda**: icono + color, nombre (Personal, Familia,
    Trabajo A, Trabajo B, Proyectos), contador de entradas.
  - **FAB / botón "+ Nueva bóveda"**.
  - Acceso rápido a búsqueda.
- **Estados:** vacío (ilustración + "Creá tu primera bóveda"), con bóvedas, cargando/sync
  (indicador de sincronización).
- **Interacciones:** tap → detalle de bóveda; long-press → editar/eliminar.

## 7. Crear / Editar bóveda
- **Propósito:** definir una bóveda.
- **Contenido:** campo nombre, **selector de color**, **selector de icono**, botón guardar;
  si edita, botón eliminar (con confirmación que advierte que borra sus entradas).
- **Estados:** crear vs editar, validación de nombre, guardando.

## 8. Detalle de bóveda (lista de entradas)
- **Propósito:** ver/gestionar las entradas de una bóveda.
- **Contenido:**
  - Header con nombre de la bóveda + color.
  - **Barra de búsqueda** dentro de la bóveda.
  - **Chips de categoría/etiqueta** para filtrar.
  - **Lista de entradas:** cada fila = icono de marca + título + usuario/email + botón
    copiar rápido.
  - **FAB "+ Nueva entrada"**.
- **Estados:** vacío, con entradas, resultados de filtro vacíos.
- **Interacciones:** tap → detalle de entrada; swipe → copiar/eliminar.

## 9. Detalle de entrada
- **Propósito:** ver una credencial.
- **Contenido:**
  - Icono de marca grande + título.
  - Campos: usuario/email, **contraseña oculta (•••)** con mostrar/ocultar y **copiar**
    (toast "Copiado, se borra en 30s"), URL/sitio (abrible), notas, categoría.
  - Metadatos: última modificación.
  - Botones **Editar** y **Eliminar**.
- **Estados:** contraseña oculta/visible, copiado (feedback), eliminando (confirmación).

## 10. Crear / Editar entrada
- **Propósito:** formulario de credencial.
- **Contenido:**
  - Campo título + **detección automática de icono de marca** según el sitio/título.
  - Usuario/email, contraseña con toggle y **botón "Generar"** (abre el generador o inline).
  - URL, notas, selector de categoría/etiquetas, selector de bóveda.
  - Botón guardar.
- **Estados:** crear vs editar, validación, sugerencia de icono, guardando.

## 11. Buscar (tab 2)
- **Propósito:** búsqueda global en todas las bóvedas.
- **Contenido:** barra de búsqueda con foco automático, resultados agrupados por bóveda,
  cada resultado con icono + título + bóveda de origen. Búsquedas recientes.
- **Estados:** vacío (sugerencias/recientes), escribiendo, sin resultados, con resultados.

## 12. Generador de contraseñas (tab 3)
- **Propósito:** crear contraseñas fuertes.
- **Contenido:**
  - **Contraseña generada grande** arriba, con botón regenerar y copiar.
  - **Slider de longitud** (ej. 8–64).
  - Toggles: mayúsculas, minúsculas, números, símbolos; "evitar ambiguos".
  - **Medidor de fuerza/entropía**.
  - Botón "Usar en nueva entrada".
- **Estados:** generada, copiada, sin tipos seleccionados (deshabilitar generar).

## 13. Ajustes (tab 4)
- **Propósito:** configuración y accesos.
- **Contenido (lista de secciones):**
  - **Seguridad:** activar biometría, tiempo de auto-lock, cambiar contraseña maestra,
    bloquear capturas de pantalla.
  - **Importar/Exportar:** importar CSV, exportar bóveda cifrada.
  - **Apariencia:** tema claro/oscuro/sistema.
  - **Sincronización:** estado, forzar sync, cuenta/email.
  - **Acerca de:** versión, open source (link al repo), licencia.
  - **Cerrar sesión.**

## 14. Importar CSV
- **Propósito:** migrar el Excel (exportado a CSV) a una bóveda.
- **Contenido (paso a paso / wizard):**
  1. Instrucción "Exportá tu Excel como CSV" + botón **Elegir archivo**.
  2. **Mapeo de columnas:** asignar columnas del CSV a campos (título, usuario,
     contraseña, URL, notas).
  3. **Previsualización** de filas a importar + selector de bóveda destino.
  4. Confirmar → barra de progreso → resumen (X importadas, Y omitidas).
- **Estados:** sin archivo, archivo cargado, mapeo, preview, importando, resultado/errores.

## 15. Seguridad (sub-pantalla de Ajustes)
- **Propósito:** controles de seguridad detallados.
- **Contenido:** toggle biometría, selector de auto-lock (inmediato/1/5/15 min), cambiar
  contraseña maestra (flujo con re-cifrado), toggle anti-screenshot.
- **Estados:** cambios guardados, flujo de cambio de maestra (confirmaciones).

## 16. Acerca de / Open Source
- **Propósito:** transparencia, comunidad y **atribución del creador (marca JasubiP)**.
- **Contenido:**
  - Logo de la app + nombre "Open Password" + versión.
  - **Bloque de autoría:** **imagotipo horizontal en blanco**
    (`docs/design/brand/jasubip-horizontal.png`, sobre superficie de acento/oscura) +
    "Creado por **JasubiP**" y, si se desea, links (GitHub, web/redes del autor).
  - **Leyenda de marca registrada:** *"JasubiP® — Marca registrada 2015–2026. Todos los
    derechos reservados."*
  - Descripción breve del modelo cero-conocimiento (por qué es segura).
  - **Open source:** botón/link al repositorio en GitHub.
  - **Licencia:** "MIT — © 2026 Jasubi Piñeyro" (link al texto completo).
  - Créditos de librerías (simple-icons, noble, Supabase, Expo).
- **Estados:** estática; links abren navegador/app externa (confirmación al salir).

---

## Marca de la app (Open Password)

La identidad visual de la app es el **escudo Open Password**: escudo oscuro con águila +
alas y un candado/cerradura en acento **teal/cyan**. Es la marca de **producto** (distinta
de la marca del **autor**, JasubiP, ver más abajo).

### Logo / identidad (acento teal)
- Color de acento confirmado por el logo: **teal/cyan** sobre superficies oscuras. La
  paleta de la app debe girar en torno a este acento + neutros oscuros.
- El logo es premium y detallado → en tamaños chicos (filas, headers) usar el **escudo**
  solo; el lockup con wordmark se reserva para splash/onboarding/Acerca de.

### Mapa de assets (`docs/design/brand/`)

| Archivo | Tamaño | Fondo | Uso |
|---|---|---|---|
| `open_password_logo_background_transparent.png` | 500×500 | transparente | logo in-app (splash, onboarding, headers), **foreground del icono adaptativo Android** |
| `open_password_logo_background_white.png` | 1254×1254 | blanco opaco | base para el **icono de iOS** (1024×1024, requiere opaco) |
| `open_password_logo_horizontal.png` | 1536×1024 | blanco | lockup escudo + "Open Password" → **Acerca de**, headers, README |
| `jasubip-vertical.png` | 1000×1000 | transparente (blanco) | imagotipo del **autor** (atribución) |
| `jasubip-horizontal.png` | 3000×1000 | transparente (blanco) | imagotipo del **autor** (atribución) |

**Icono de la app (Expo):**
- **iOS** (`icon`, 1024×1024 opaco): partir de `..._background_white.png` (redimensionar a
  1024) o, mejor para el look premium, el escudo sobre fondo **oscuro** sólido.
- **Android adaptativo** (`adaptiveIcon.foregroundImage` transparente +
  `backgroundColor`): usar el escudo transparente como foreground sobre un `backgroundColor`
  oscuro/teal.
- ⚠️ El escudo transparente es **500×500**; para un icono nítido a 1024 conviene **exportar
  una versión ≥1024×1024** del escudo con transparencia (pendiente).

---

## Marca y atribución del autor (JasubiP)

Distinta del logo de producto: es el **crédito al creador**. Aunque la app es **open source
(MIT)**, la marca del autor se mantiene presente de forma visible pero **discreta**, sin
molestar el uso diario (la licencia MIT ya obliga a conservar el aviso de copyright).

### Assets del autor (`docs/design/brand/`)
- **`jasubip-vertical.png`** → versión **vertical** (formato cuadrado/alto).
- **`jasubip-horizontal.png`** → versión **horizontal**, para Acerca de / footers de crédito.
- Ambos son **imagotipos en blanco** → requieren **fondo oscuro o con color de acento** para
  verse correctamente. Para fondos claros, prever una variante en color/oscuro (pendiente de
  exportar) o colocarlos sobre una superficie de acento.

### Texto de marca registrada (obligatorio)
Mostrar siempre la leyenda de marca registrada con el rango de años:

> **JasubiP® — Marca registrada 2015–2026. Todos los derechos reservados.**

Versión corta (para pies de pantalla / espacios reducidos):

> **JasubiP® 2015–2026**

### Dónde aparece la marca "JasubiP"
- **Splash (pantalla 1):** el héroe es el **logo de la app** (escudo Open Password); la
  marca del autor aparece solo como **crédito de texto al pie** → *"JasubiP® 2015–2026"*.
- **Onboarding (pantalla 2):** opcionalmente, imagotipo horizontal pequeño o firma
  "JasubiP®" en el último slide.
- **Desbloqueo / Login (5 y 4):** firma discreta al pie → *"JasubiP® 2015–2026"*.
- **Ajustes (pantalla 13):** fila "Acerca de" que lleva a la pantalla 16; debajo del todo,
  texto tenue *"Open Password · JasubiP® 2015–2026"*.
- **Acerca de (pantalla 16):** atribución principal y completa → **imagotipo horizontal** +
  bloque de autoría + **leyenda completa de marca registrada (2015–2026)** + repo + licencia.

### Reglas de diseño para la marca
- Estilo **discreto**: tamaño pequeño, color tenue/secundario, nunca tapa contenido ni
  interfiere con acciones. Es un crédito, no un anuncio.
- **No** aparece dentro de las listas de bóvedas/entradas ni en el generador (zonas de
  trabajo del usuario), para no recargar.
- Coherente en claro/oscuro: los imagotipos blancos van sobre fondo oscuro/acento; el texto
  de marca usa el color secundario del tema.
- El **imagotipo y el nombre "JasubiP"/"Open Password"** son identidad del autor; un fork
  puede quitarlos, pero **debe conservar el aviso de copyright MIT** en el código.
- Mantener proporción de los imagotipos (no deformar) y un área de respeto mínima alrededor.

---

## Componentes reutilizables (design system)
- **VaultCard:** tarjeta de bóveda (icono, color, nombre, contador).
- **EntryRow / ItemRow:** fila de entrada (icono de marca, título, subtítulo, copiar).
- **BrandIcon:** logo **a color** de la empresa/app (Google, Microsoft, Facebook…) desde la
  colección "Logos" (`assets/brand-logos/`, vía `react-native-svg`); fallback a avatar de
  inicial + color cuando no exista el logo.
- **Iconos de UI** (lupa, candado, ojo, +, ajustes…): `@expo/vector-icons` — NO `react-icons`
  (esa librería es solo para web y no corre en React Native).
- **PasswordField:** campo con toggle mostrar/ocultar + copiar + medidor de fuerza.
- **StrengthMeter:** barra de fuerza/entropía.
- **SearchBar**, **CategoryChip**, **PrimaryButton/SecondaryButton**, **FAB**,
  **Toast/Snackbar** (feedback de copiado), **EmptyState** (ilustración + CTA),
  **BiometricButton**, **ConfirmDialog**.

## Estados globales a diseñar
- Loading / skeletons, vacío (empty states), error, sin conexión (modo offline),
  sincronizando, contraseña copiada (toast con auto-borrado).

## Paleta y tipografía (sugerido, ajustable en diseño)
- **Acento: teal/cyan**, tomado del logo de la app (escudo Open Password), sobre neutros
  oscuros (look premium). Semánticos: verde (fuerte/ok), ámbar (media), rojo (débil/error).
- Tema claro y oscuro con superficies neutras. Tipografía sans legible (system / Inter).
- **Logos de marcas a color** (colección "Logos"): se muestran con sus colores oficiales
  (la G multicolor de Google, el azul de Facebook, los cuadros de Microsoft, etc.).
- **Iconos de UI** monocromos vía `@expo/vector-icons`, teñidos con el color del tema.
