# Documentación — Open Password

Índice de la documentación del proyecto. Pensada para que cualquier dev entienda **qué se
construye, cómo y por qué**.

## Contenido

- **[architecture.md](architecture.md)** — diseño técnico: stack, arquitectura de seguridad
  (cero-conocimiento), modelo de datos y plan de implementación por fases.
- **[adr/](adr/)** — *Architecture Decision Records*: una nota corta por decisión
  importante, con su contexto, la decisión tomada y sus consecuencias.
- **[design/screens.md](design/screens.md)** — especificación de las 16 pantallas (UI/UX),
  estados, navegación y design system.
- **[design/brand/](design/brand/)** — imagotipos de la marca del autor (**JasubiP**).
- **[design/handoff/](design/handoff/)** — entrega de diseño (prototipo y referencias
  visuales).

## Decisiones (ADR)

| # | Decisión |
|---|---|
| [0001](adr/0001-stack-expo-react-native.md) | Stack: Expo + React Native (TypeScript) |
| [0002](adr/0002-cifrado-cero-conocimiento.md) | Cifrado cero-conocimiento |
| [0003](adr/0003-sync-supabase.md) | Sincronización con Supabase |
| [0004](adr/0004-iconos-logos-color.md) | Iconos de UI y logos de marca a color |

> ¿Nueva decisión relevante? Copiá el formato de un ADR existente, numéralo correlativo y
> agregalo a la tabla.
