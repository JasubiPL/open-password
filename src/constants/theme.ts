/**
 * Paleta y tema de Open Password.
 * Acento teal/cyan tomado del logo (escudo) sobre superficies oscuras.
 * Ver docs/design/screens.md → "Paleta y tipografía".
 */

export const Colors = {
  accent: '#2DD4BF', // teal/cyan de la marca
  accentDark: '#14B8A6',

  // Superficies oscuras (tema principal)
  background: '#0E1116', // fondo del splash/app
  surface: '#161B22',
  surfaceAlt: '#1F2630',
  border: '#2A323D',

  text: '#E6EDF3',
  textMuted: '#8B98A5',

  // Semánticos (fuerza de contraseña / estados)
  success: '#3FB950', // fuerte / ok
  warning: '#D29922', // media
  danger: '#F85149', // débil / error
} as const;

export type AppColors = typeof Colors;
