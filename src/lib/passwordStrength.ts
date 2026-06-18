/**
 * Estimador de fuerza de la contraseña maestra (heurística ligera, sin deps).
 * No pretende ser zxcvbn; solo guía al usuario hacia una maestra robusta.
 */
export type StrengthLevel = 'weak' | 'medium' | 'strong';

export interface StrengthResult {
  /** 0..4 */
  score: number;
  level: StrengthLevel;
}

/** Longitud mínima aceptada para la contraseña maestra. */
export const MIN_MASTER_PASSWORD_LENGTH = 8;

export function estimateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, level: 'weak' };

  let score = 0;
  if (password.length >= MIN_MASTER_PASSWORD_LENGTH) score++;
  if (password.length >= 12) score++;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes >= 2) score++;
  if (classes >= 3) score++;

  const level: StrengthLevel = score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong';
  return { score, level };
}

/** True si la contraseña cumple el mínimo para crear cuenta. */
export function isAcceptableMasterPassword(password: string): boolean {
  return password.length >= MIN_MASTER_PASSWORD_LENGTH && estimateStrength(password).level !== 'weak';
}
