# ADR 0001 — Stack: Expo + React Native (TypeScript)

- **Estado:** Aceptada
- **Fecha:** 2026-06-17

## Contexto
Open Password es una app mobile open source para gestionar contraseñas. Necesitamos
iOS + Android con un solo código, fácil de mantener y de contribuir para otros devs.

## Decisión
Usar **React Native con Expo** y **TypeScript**, con **Expo Router** (navegación
file-based). El MVP debe poder correr en **Expo Go** (sin build nativo).

## Consecuencias
- ✅ Un solo código para iOS y Android; ecosistema grande y familiar para devs JS/TS.
- ✅ TypeScript aporta seguridad de tipos en la lógica sensible (cripto, modelo de datos).
- ✅ Expo Go agiliza el arranque y baja la barrera de contribución.
- ⚠️ Algunas capacidades nativas (p. ej. autofill del sistema) requerirán un *dev build*
  más adelante; quedan fuera del MVP.
- ⚠️ La cripto se hace en JS puro (ver [ADR 0002](0002-cifrado-cero-conocimiento.md)) para
  no depender de módulos nativos y mantener compatibilidad con Expo Go.
