import { Colors } from './theme';

/** Iconos disponibles para una bóveda (nombres de Ionicons). */
export const VAULT_ICONS = [
  'lock-closed',
  'person',
  'people',
  'briefcase',
  'home',
  'card',
  'globe',
  'rocket',
  'heart',
  'star',
  'school',
  'game-controller',
] as const;

/** Paleta de colores para una bóveda. */
export const VAULT_COLORS = [
  Colors.accent,
  '#F85149',
  '#D29922',
  '#3FB950',
  '#A371F7',
  '#DB61A2',
  '#E3742F',
  '#58A6FF',
] as const;

export const DEFAULT_VAULT_ICON = VAULT_ICONS[0];
export const DEFAULT_VAULT_COLOR = VAULT_COLORS[0];
