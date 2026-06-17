# Handoff: Open Password — App móvil gestor de contraseñas (dirección "Vault")

## Overview
Open Password es un gestor de contraseñas mobile (iOS + Android) con bóvedas, cifrado
cero-conocimiento, desbloqueo biométrico, generador, import CSV e iconos de marca. Este
paquete documenta la **dirección visual "Vault"** (tema oscuro, acento menta-teal) elegida
por el cliente, lista para implementarse en una app real.

La especificación funcional completa de las 16 pantallas está en `screens.md` (incluida en
este bundle). El README describe el **sistema visual** y el detalle de las pantallas ya
diseñadas para que un desarrollador las pueda recrear con fidelidad.

## About the Design Files
Los archivos `.dc.html` de este bundle son **referencias de diseño creadas en HTML** —
prototipos que muestran el look & feel y el comportamiento previsto, **no código de
producción para copiar tal cual**. La tarea es **recrear estos diseños en el entorno del
proyecto destino** (React Native / Expo, SwiftUI, Flutter, etc.) usando sus patrones y
librerías. Si todavía no hay codebase, la recomendación para una app multiplataforma de
este tipo es **React Native + Expo** (o **SwiftUI** si es solo iOS).

> Nota técnica: el formato `.dc.html` ("Design Component") es solo el medio del prototipo.
> No intentes portar ese runtime — reimplementá la UI con componentes nativos del stack.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios y estados son finales.
Recreá la UI pixel-perfect con las librerías del codebase. Las medidas están dadas en px a
escala 1× de un viewport de iPhone (ancho de pantalla ≈ 340px de contenido dentro del marco).

---

## Design Tokens

### Color (tema oscuro — Vault)
| Token | Hex | Uso |
|---|---|---|
| `bg/screen` | `#0E1417` | Fondo de pantalla |
| `surface` | `#16242B` | Tarjetas, filas, campos |
| `surface/alt` | `#18232A` | Campos de input, chips, header pills |
| `surface/elevated` | `#1F2E36` | Botones secundarios sobre surface |
| `border` | `#20323A` | Borde de tarjetas |
| `border/alt` | `#243640` / `#2A4049` | Bordes de inputs y botones redondos |
| `divider` | `#1D2D34` | Separadores dentro de tarjetas |
| `text/primary` | `#EAF2F0` | Títulos y valores |
| `text/secondary` | `#9FBDC2` | Texto de apoyo |
| `text/muted` | `#7E9AA0` | Subtítulos, placeholders |
| `text/disabled` | `#587179` | Labels de sección, iconos inactivos |
| `accent` | `#34E0C4` | Acento primario (menta-teal), CTAs, activos |
| `accent/on` | `#06201C` | Texto/icono sobre acento |
| `success` | `#46D39A` | Fuerza fuerte, sync OK |
| `warning` | `#FFB454` | Fuerza media |
| `danger` | `#FF6B6B` | Error / eliminar |
| `brand/blue` | `#6FA0FF` | Icono bóveda Trabajo |
| `brand/violet`| `#C480FF` | Icono bóveda Proyectos |

Colores de marcas de bóveda (chips de icono al 16% de opacidad sobre el color): Personal =
accent `#34E0C4`, Familia = `#FFB454`, Trabajo = `#6FA0FF`, Proyectos = `#C480FF`.

> **Tema claro:** el spec pide claro + oscuro desde el día uno. Definir un set espejo con
> superficies neutras claras manteniendo el mismo acento `#34E0C4` y semánticos. Las otras
> dos direcciones exploradas ("Calma" claro, "Bold") sirven de referencia si se necesitan.

### Tipografía
- **Display / títulos:** `Space Grotesk` (700 títulos de pantalla, 600 títulos de detalle/botones).
- **Cuerpo / UI:** `Manrope` (400–700).
- **Monoespaciada (contraseñas, longitud, entropía):** `JetBrains Mono` (400–600).

| Rol | Familia | Tamaño | Peso | Notas |
|---|---|---|---|---|
| Título de pantalla | Space Grotesk | 28px | 700 | letter-spacing −.02em |
| Título de detalle (marca) | Space Grotesk | 23–24px | 600/700 | |
| Heading hero (login) | Space Grotesk | 24px | 700 | |
| Item / valor de fila | Manrope | 15–16px | 600 | |
| Subtítulo / email | Manrope | 12.5–13px | 400/500 | color muted |
| Label de campo | Manrope | 11px | 600 | uppercase, letter-spacing .08em, color `#6C8990` |
| Label de sección | Manrope | 11px | 700 | uppercase, letter-spacing .10em, color `#587179` |
| Contraseña mono | JetBrains Mono | 17–21px | 500 | letter-spacing 2–3px |
| Tab bar | Manrope | 10.5px | 600 | |

### Espaciado, radios y sombras
- **Padding de pantalla:** 20px horizontal.
- **Gap entre filas/tarjetas:** 9–13px. **Gap en grid de bóvedas:** 13px.
- **Radios:** tarjeta/fila 15–18px · campo 13–15px · chip de icono 11–14px · pill/chip 20px ·
  botón 15px · FAB circular 50% · toggle 14px · marco de teléfono pantalla 37px.
- **Sombra de CTA/FAB acento:** `0 12px 26px -6px rgba(52,224,196,.55)`.
- **Altura de controles:** botón primario 52–54px · input 50–54px · toggle 46×27px (knob 21px) ·
  FAB 58px · touch targets ≥ 44px.
- **Tab bar:** alto 84px, fondo `#0B1417`, borde superior `#1B2A31`, 4 items.

### Iconografía
- UI: iconos de línea (stroke 2, estilo Lucide/Feather), 18–26px.
- Marcas (GitHub, GitLab, Vercel, Figma, Notion, Spotify…): **simple-icons**, renderizadas
  sobre cuadro blanco redondeado (40px, radio 11px) en listas, o 64–72px en detalle.
  En el prototipo se cargan de `https://cdn.simpleicons.org/<slug>/<hex>`; en la app usar el
  paquete `simple-icons` local con fallback a avatar de inicial + color (componente `BrandIcon`).

---

## Screens / Views

> Cinco pantallas diseñadas. El mapa completo (16 pantallas + estados) está en `screens.md`.

### 1. Bóvedas — Home (tab 1)  · `Propuestas UI.dc.html`
- **Propósito:** pantalla principal; lista de bóvedas.
- **Layout:** header (título + avatar/ajustes a la derecha), barra de búsqueda, **grid 2×2**
  de tarjetas de bóveda (gap 13px), FAB `+` abajo-derecha sobre la tab bar.
- **Componentes:**
  - Título "Bóvedas" (Space Grotesk 28/700) + sublínea "4 bóvedas · 49 entradas · sync" con
    punto `#46D39A`. Botón avatar 40px circular `#18232A`.
  - Search pill `#18232A`, borde `#233540`, radio 14px, ícono lupa + "Buscar en todas las bóvedas".
  - **VaultCard** (`#16242B`, borde `#20323A`, radio 18px, padding 16px): chip de icono 42px
    (color de marca al 16%), nombre 16/600, contador "N entradas" 12.5px muted.
  - **FAB** 58px circular `#34E0C4`, icono `+` `#06201C`.
- **Interacciones:** tap → detalle de bóveda; long-press → editar/eliminar.

### 2. Detalle de entrada  · `Propuestas UI.dc.html`
- **Propósito:** ver una credencial.
- **Layout:** top bar (back / breadcrumb / editar), bloque centrado de marca, tarjeta de
  campos agrupados, tarjeta de notas, meta, y al fondo botones Editar + Eliminar.
- **Componentes:**
  - Icono de marca 72px sobre cuadro blanco redondo (radio 20px, sombra). Título 23/600,
    dominio muted.
  - Tarjeta de campos (`#16242B`): fila **Usuario** (label uppercase + valor + botón copiar
    accent) con divider; fila **Contraseña** = dots mono `••••••••••••` (JetBrains Mono 18px,
    letter-spacing 3px) + botones ojo (muted) y copiar (accent) + **StrengthMeter** (4 segmentos,
    fuerte = 4× `#46D39A`, label "Fuerte").
  - Tarjeta **Notas**. Meta: reloj + "Modificado hace 3 días · auto-borra copia en 30s".
  - Botón **Editar** (accent, 52px) + botón **Eliminar** (52px cuadrado, fondo `rgba(255,107,107,.1)`,
    borde `#4A2A2E`, icono trash `#FF6B6B`).
- **Estados:** contraseña oculta/visible, toast "Copiado, se borra en 30s", confirmación al eliminar.

### 3. Desbloqueo (lock screen)  · `Vault — 4 pantallas.dc.html`
- **Propósito:** desbloquear la bóveda en cada apertura/auto-lock.
- **Layout:** verticalmente centrado: candado en cuadro redondeado, nombre, email enmascarado,
  campo de maestra + botón "Desbloquear"; abajo botón biométrico grande + "Usar otra cuenta".
- **Componentes:**
  - Candado 80px en cuadro `rgba(52,224,196,.12)` borde `rgba(52,224,196,.3)` radio 24px.
  - "Open Password" 24/700; email `a•••••z@gmail.com` muted.
  - Campo maestra `#18232A` borde `#2A4049` radio 15px: icono candado accent + dots + ojo.
  - Botón **Desbloquear** accent 54px.
  - **BiometricButton** 74px (radio 24px, `#18232A`) con glifo Face ID accent + "Tocá para usar Face ID".
  - Link "Usar otra cuenta" accent.
- **Estados:** esperando biometría, error con contador de intentos, desbloqueando.

### 4. Detalle de bóveda — lista de entradas  · `Vault — 4 pantallas.dc.html`
- **Propósito:** ver/gestionar las entradas de una bóveda (ej. "Trabajo", 24 entradas).
- **Layout:** top bar (back / overflow ⋮), header de bóveda (chip color + nombre + contador),
  search interna, **chips de categoría** (Todos activo accent / Dev / Cloud / Social), lista de
  **EntryRow**, FAB `+`.
- **Componentes:**
  - **CategoryChip:** activo = `#34E0C4` texto `#06201C`; inactivo = `#18232A` borde `#243640`
    texto `#9FBDC2`, radio 20px, padding 7×14.
  - **EntryRow** (`#16242B`, borde `#20323A`, radio 15px, padding 13×14, gap 13): BrandIcon 40px
    (cuadro blanco) + título 15/600 + subtítulo email 12.5 muted + botón copiar accent.
    Marcas mostradas: GitHub, GitLab, Vercel, Figma, Notion.
- **Interacciones:** tap → detalle de entrada; swipe → copiar/eliminar.

### 5. Generador de contraseñas (tab 3)  · `Vault — 4 pantallas.dc.html`
- **Propósito:** crear contraseñas fuertes.
- **Layout:** título, tarjeta con contraseña generada grande + acciones, slider de longitud,
  lista de toggles, botón "Usar en nueva entrada" al fondo.
- **Componentes:**
  - Tarjeta de salida (`#16242B`): contraseña en JetBrains Mono 21px con **color por tipo de
    carácter** (letras `#EAF2F0`, números `#34E0C4`, símbolos `#FFB454`); línea de fuerza
    "Fuerte · 92 bits" (`#46D39A`) + botón regenerar (`#1F2E36`) + botón copiar (accent).
  - **Slider** de longitud: track `#1F2E36` 6px, relleno accent, knob 24px accent; valor "20"
    en mono accent; rótulos 8 / 64.
  - **Toggles** (filas con divider): Mayúsculas A-Z, Números 0-9, Símbolos !@# (ON = accent),
    Evitar ambiguos l1O0 (OFF = `#243640`). Pista de caracteres en mono `#587179`.
  - Botón **Usar en nueva entrada** accent 54px.
- **Estados:** generada, copiada, sin tipos seleccionados → deshabilitar generar.

### 6. Ajustes (tab 4)  · `Vault — 4 pantallas.dc.html`
- **Propósito:** configuración y accesos.
- **Layout:** título, tarjeta de cuenta, secciones agrupadas (Seguridad; Datos · Apariencia),
  botón Cerrar sesión, pie de versión.
- **Componentes:**
  - Tarjeta de cuenta: avatar inicial 46px accent + nombre + email + badge "Sync" `#46D39A`.
  - Sección **Seguridad** (tarjeta agrupada con dividers): Desbloqueo biométrico (toggle ON),
    Auto-bloqueo (valor "1 min ›"), Cambiar contraseña maestra (chevron), Bloquear capturas (toggle OFF).
  - Sección **Datos · Apariencia:** Importar CSV (chevron), Tema (valor "Oscuro ›").
  - Botón **Cerrar sesión** (texto/borde danger, fondo `rgba(255,107,107,.08)`).
  - Pie: "Open Password v1.0 · cero-conocimiento · MIT" `#587179`.

---

## Componentes reutilizables a construir
`VaultCard`, `EntryRow`/`ItemRow`, `BrandIcon` (con fallback inicial+color), `PasswordField`
(toggle mostrar/ocultar + copiar + medidor), `StrengthMeter` (4 segmentos), `SearchBar`,
`CategoryChip`, `PrimaryButton`/`SecondaryButton`, `FAB`, `Toast/Snackbar` (copiado con
auto-borrado 30s), `EmptyState`, `BiometricButton`, `ConfirmDialog`, `Toggle`, `Slider`,
`SettingsRow`, `SectionCard`, `TabBar` (4 tabs: Bóvedas, Buscar, Generador, Ajustes).

## Interactions & Behavior
- **Navegación por tabs** (4) + stacks: Bóvedas → Detalle de bóveda → Detalle de entrada → Editar.
- **Copiar:** toast "Copiado, se borra en 30s" + borrado de clipboard a los 30s.
- **Mostrar/ocultar contraseña:** toggle del ojo; oculta por defecto (•••).
- **Auto-lock:** vuelve a la pantalla de Desbloqueo tras el tiempo configurado / al pasar a background.
- **Biometría:** Face ID / huella; fallback a maestra; contador de intentos en error.
- **Generador:** regenerar recalcula; sin tipos seleccionados → "Generar" deshabilitado.
- **Long-press en VaultCard:** editar/eliminar (eliminar advierte que borra sus entradas).
- **Swipe en EntryRow:** copiar / eliminar.
- Transiciones nativas de stack; micro-interacciones suaves (~150–200ms) en toggles y copiar.

## State Management
- `auth`: estado de sesión, bloqueado/desbloqueado, biometría habilitada, intentos.
- `vaults`: lista de bóvedas (id, nombre, color, icono, contador).
- `entries`: por bóveda (id, marca/slug, título, usuario, password cifrada, url, notas,
  categoría, updatedAt).
- `generator`: longitud, flags (mayúsculas, minúsculas, números, símbolos, evitar ambiguos),
  resultado, entropía.
- `settings`: tema (claro/oscuro/sistema), auto-lock, anti-screenshot, sync.
- Cifrado **cero-conocimiento**: la maestra deriva la clave; nada de texto plano persistido.

## Assets
- **Iconos UI:** set de línea (Lucide/Feather equivalente).
- **Iconos de marca:** `simple-icons` (monocromas, teñibles). En el prototipo vía CDN
  `cdn.simpleicons.org`; en producción usar el paquete local. `BrandIcon` cae a inicial+color.
- **Fuentes:** Space Grotesk, Manrope, JetBrains Mono (Google Fonts / empaquetar en la app).
- No hay imágenes raster propias; logo de marca pendiente de definir (placeholder candado).

## Files (en este bundle)
- `screens.md` — especificación funcional completa (16 pantallas, estados, componentes).
- `Propuestas UI.dc.html` — Bóvedas (home) + Detalle de entrada en la dirección Vault (col. 1).
- `Vault — 4 pantallas.dc.html` — Desbloqueo, Detalle de bóveda, Generador, Ajustes.

Para ver los prototipos: abrir los `.dc.html` en un navegador moderno.
