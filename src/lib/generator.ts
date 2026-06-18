/**
 * Generador de contraseñas seguro (Fase 5).
 *
 * Usa el CSPRNG (`randomBytes`, `expo-crypto`) con muestreo por rechazo para
 * elegir caracteres sin sesgo de módulo. Garantiza al menos un carácter de cada
 * categoría seleccionada y luego baraja (Fisher-Yates con la misma fuente).
 */
import { randomBytes } from '@/crypto';

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  /** Evita caracteres ambiguos (l, I, 1, O, 0, o…). */
  avoidAmbiguous: boolean;
}

export const GENERATOR_LENGTH = { min: 8, max: 64, default: 20 } as const;

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: GENERATOR_LENGTH.default,
  uppercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
};

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';
const AMBIGUOUS = new Set('lI1O0o|`'.split(''));

function strip(set: string, avoidAmbiguous: boolean): string {
  return avoidAmbiguous ? [...set].filter((c) => !AMBIGUOUS.has(c)).join('') : set;
}

/** Entero uniforme en [0, max) usando rechazo para evitar sesgo de módulo. */
function randomInt(max: number): number {
  if (max <= 0) throw new RangeError('randomInt: max debe ser > 0');
  const limit = Math.floor(256 / max) * max; // mayor múltiplo de `max` que cabe en un byte
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const byte = randomBytes(1)[0];
    if (byte < limit) return byte % max;
  }
}

function pick(set: string): string {
  return set[randomInt(set.length)];
}

/** Construye el pool de caracteres según las opciones (lowercase siempre incluido). */
function buildSets(opts: GeneratorOptions): string[] {
  const sets = [strip(LOWER, opts.avoidAmbiguous)];
  if (opts.uppercase) sets.push(strip(UPPER, opts.avoidAmbiguous));
  if (opts.numbers) sets.push(strip(DIGITS, opts.avoidAmbiguous));
  if (opts.symbols) sets.push(strip(SYMBOLS, opts.avoidAmbiguous));
  return sets;
}

/** Genera una contraseña según las opciones. */
export function generatePassword(opts: GeneratorOptions): string {
  const length = Math.max(GENERATOR_LENGTH.min, Math.min(GENERATOR_LENGTH.max, Math.floor(opts.length)));
  const sets = buildSets(opts);
  const pool = sets.join('');

  // Al menos un carácter de cada categoría seleccionada.
  const chars: string[] = sets.map((s) => pick(s));
  while (chars.length < length) chars.push(pick(pool));

  // Fisher-Yates para que los caracteres garantizados no queden al principio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** Bits de entropía aproximados: length · log2(tamaño del pool). */
export function entropyBits(opts: GeneratorOptions): number {
  const pool = buildSets(opts).join('').length;
  return Math.round(opts.length * Math.log2(pool));
}

export type GeneratorStrength = 'weak' | 'medium' | 'strong';

/** Clasifica la fuerza por bits de entropía. */
export function strengthFromBits(bits: number): GeneratorStrength {
  if (bits < 50) return 'weak';
  if (bits < 75) return 'medium';
  return 'strong';
}
