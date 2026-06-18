# ADR 0004 — Iconos de UI y logos de marca a color

- **Estado:** Aceptada
- **Fecha:** 2026-06-17

## Contexto
La app necesita (a) iconos de interfaz (lupa, candado, ojo, +, ajustes…) y (b) **logos a
color** de las empresas/apps de cada entrada (Google, Microsoft, Facebook…) para
reconocimiento visual rápido. Se evaluó `react-icons`.

## Decisión
- **Iconos de UI:** **`@expo/vector-icons`** (incluido en Expo).
- **Logos de marca a color:** bundlear SVGs full-color de la colección **"Logos"**
  (gilbarbara, MIT) en `assets/brand-logos/`, renderizados con **`react-native-svg`** (vía
  `react-native-svg-transformer`). Fallback a avatar con inicial + color cuando no exista
  el logo.

**`react-icons` queda descartado**: renderiza SVG del DOM web y **no funciona en React
Native**.

## Consecuencias
- ✅ Logos con sus colores oficiales (mejor reconocimiento que iconos monocromos).
- ✅ Bundle local → funciona offline y no filtra a qué servicios se loguea el usuario
  (coherente con cero-conocimiento; evita APIs externas de favicons).
- ⚠️ Hay que mantener el set de logos bundleados (agregar marcas nuevas a demanda).
- ℹ️ `simple-icons` (monocromo) se descartó para los logos por no ser a color.

## Actualización (Fase 5)
La implementación inicial usa **glifos de marca de FontAwesome6** (`@expo/vector-icons`)
renderizados sobre **tile blanco** en el color de la marca (`PlatformIcon`), con tinta oscura
para marcas casi blancas (GitHub/Apple) y fallback a inicial + color. Es coherente con el
diseño (logos sobre cuadro blanco) y no requiere bundlear SVGs ni deps extra. Los **logos
full-color en SVG** (colección "Logos" / `react-native-svg`) quedan como mejora futura cuando
se agreguen los assets; por eso se eliminaron `src/icons/` y `assets/brand-logos/` (vacíos).
