<p align="center">
  <img src="docs/design/brand/open_password_logo_horizontal.png" alt="Open Password" width="420">
</p>

<p align="center">
  Gestor de contraseñas mobile, open source y <strong>cero-conocimiento</strong>.<br>
  <em>Por JasubiP® — Marca registrada 2015–2026.</em>
</p>

---

## ¿Qué es?

**Open Password** es una app mobile (iOS + Android) para gestionar tus contraseñas con
cifrado **cero-conocimiento**: solo vos podés leer tus datos, ni siquiera el servidor.
Nace para reemplazar el clásico Excel de contraseñas por algo seguro y cómodo.

### Características (MVP)
- 🔐 **Cifrado cero-conocimiento** (Argon2id + AES-256-GCM): el servidor solo ve texto cifrado.
- 🗂️ **Bóvedas** para separar contextos (Personal, Familia, Trabajo, Proyectos…).
- ☁️ **Sincronización** entre dispositivos con Supabase (solo se suben datos cifrados).
- 👆 **Desbloqueo biométrico** (Face ID / huella), con auto-bloqueo por inactividad.
- 🎲 **Generador** de contraseñas fuertes (entropía configurable).
- 🔎 **Búsqueda global** y **logos de marca** en cada entrada.
- 🛡️ **Bloqueo de capturas** de pantalla en datos sensibles.

> Roadmap: importar desde Excel (CSV). La app es **dark-only** por diseño.

## Stack
Expo + React Native (TypeScript) · Supabase (Postgres + Auth + RLS) · cripto en JS puro
(`@noble/*`). Ver detalles en [`docs/architecture.md`](docs/architecture.md).

## Desarrollo

> Requisitos: Node LTS y la app **Expo Go** en tu teléfono (o un simulador).

```bash
npm install
npx expo start
```

Escaneá el QR con Expo Go (o abrí el simulador iOS/Android).

## Documentación
- [`docs/`](docs/) — índice de la documentación.
- [`docs/architecture.md`](docs/architecture.md) — diseño técnico y plan por fases.
- [`docs/adr/`](docs/adr/) — decisiones de arquitectura (y su porqué).
- [`docs/design/screens.md`](docs/design/screens.md) — pantallas y UX.

## Seguridad
Es un gestor de contraseñas: leé [`SECURITY.md`](SECURITY.md) para el modelo de seguridad
y cómo reportar vulnerabilidades. **Importante:** si olvidás tu contraseña maestra, tus
datos no se pueden recuperar (es el precio del cero-conocimiento).

## Contribuir
¡Bienvenidas las contribuciones! Mirá [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licencia
Código bajo [MIT](LICENSE) — © 2026 Jasubi Piñeyro.
La marca y el imagotipo **JasubiP®** son identidad del autor y no están cubiertos por la
licencia del código.
