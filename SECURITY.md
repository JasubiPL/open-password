# Política de seguridad — Open Password

Open Password es un gestor de contraseñas, así que la seguridad es prioridad.

## Modelo de seguridad (resumen)
- **Cero-conocimiento:** el servidor solo almacena datos **cifrados**. Ni el backend ni
  un atacante con acceso a la base pueden leer tus contraseñas.
- **Derivación de clave:** la contraseña maestra deriva la *Master Key* con **Argon2id**.
- **Cifrado de datos:** **AES-256-GCM** con una *Vault Key* aleatoria, que a su vez se
  guarda cifrada con la Master Key.
- **Autenticación:** se usa un *hash* derivado, no la contraseña maestra. El servidor
  nunca ve la contraseña maestra ni las claves.
- **En el dispositivo:** las claves viven en memoria; el desbloqueo biométrico usa el
  almacén seguro del sistema (Keychain / Keystore).

Detalle completo en [`docs/adr/0002-cifrado-cero-conocimiento.md`](docs/adr/0002-cifrado-cero-conocimiento.md).

> ⚠️ **No hay recuperación de cuenta.** Si olvidás tu contraseña maestra, los datos no se
> pueden descifrar. Es una consecuencia intencional del modelo cero-conocimiento.

## Reportar una vulnerabilidad
Si encontrás un problema de seguridad, **no abras un issue público**. Reportalo de forma
privada al autor (JasubiP) a través de un *security advisory* de GitHub o por contacto
directo. Incluí pasos para reproducir y el impacto potencial.

Nos comprometemos a responder a la brevedad y a dar crédito a quien reporte de forma
responsable, si así lo desea.

## Alcance
- Versión soportada: la última `main` / el último release.
- Reportes de interés: fugas de datos en claro, fallos en el cifrado o la derivación de
  claves, errores en las políticas RLS, manejo inseguro de claves o del portapapeles.
