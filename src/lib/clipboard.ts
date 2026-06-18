/**
 * Copiado al portapapeles con auto-limpieza, para no dejar contraseñas
 * disponibles indefinidamente (ver pantallas, ADR 0002).
 */
import * as Clipboard from 'expo-clipboard';

/** Segundos antes de limpiar automáticamente el portapapeles. */
export const CLIPBOARD_CLEAR_SECONDS = 30;

let clearTimer: ReturnType<typeof setTimeout> | null = null;

/** Copia `value` y programa el borrado del portapapeles tras unos segundos. */
export async function copyWithAutoClear(value: string): Promise<void> {
  await Clipboard.setStringAsync(value);
  if (clearTimer) clearTimeout(clearTimer);
  clearTimer = setTimeout(() => {
    // Solo limpiamos si sigue siendo lo que copiamos (no pisamos algo del usuario).
    Clipboard.getStringAsync()
      .then((current) => {
        if (current === value) return Clipboard.setStringAsync('');
        return undefined;
      })
      .catch(() => {});
    clearTimer = null;
  }, CLIPBOARD_CLEAR_SECONDS * 1000);
}
