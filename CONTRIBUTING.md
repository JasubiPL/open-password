# Contribuir a Open Password

¡Gracias por tu interés! Esta guía resume cómo colaborar.

## Antes de empezar
1. Leé la documentación en [`docs/`](docs/): la [arquitectura](docs/architecture.md), las
   [decisiones (ADR)](docs/adr/) y las [pantallas](docs/design/screens.md).
2. Para cambios grandes, abrí primero un *issue* para discutir el enfoque.

## Entorno
```bash
npm install
npx expo start   # abrir en Expo Go o simulador
npm test         # tests (incluye los de cripto)
```

## Estilo de código
- **TypeScript** en todo el proyecto. Seguí el ESLint/Prettier del repo.
- Nombres y comentarios claros; el código debe leerse como el de alrededor.
- La lógica sensible (cripto, manejo de claves) debe ir acompañada de **tests**.

## Reglas de seguridad (importante)
Es un gestor de contraseñas — extremá cuidados:
- **Nunca** loguees contraseñas, claves, ni el contenido descifrado de las bóvedas.
- No persistas claves en claro; respetá el modelo cero-conocimiento (ver
  [ADR 0002](docs/adr/0002-cifrado-cero-conocimiento.md)).
- Cambios que toquen cripto, auth o RLS requieren revisión cuidadosa y tests.

## Pull Requests
- Una rama por cambio; commits con mensajes descriptivos.
- Describí **qué** cambia y **por qué**; referenciá issues/ADR relacionados.
- Si tu cambio implica una decisión de arquitectura, agregá o actualizá un **ADR** en
  [`docs/adr/`](docs/adr/).
- Asegurate de que `npm test` pase.

## Decisiones de arquitectura (ADR)
Las decisiones importantes se registran como ADRs cortos. Para una nueva, copiá el formato
de un ADR existente, numéralo correlativo y añadilo a la tabla de [`docs/README.md`](docs/README.md).

## Licencia y marca
Al contribuir aceptás que tu aporte se publique bajo la licencia [MIT](LICENSE).
El nombre/imagotipo **JasubiP®** son del autor y no se incluyen en esa licencia: no los
uses como identidad propia en un fork.
