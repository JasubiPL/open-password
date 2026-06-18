import {
  DEFAULT_GENERATOR_OPTIONS,
  GENERATOR_LENGTH,
  entropyBits,
  generatePassword,
  strengthFromBits,
  type GeneratorOptions,
} from '../generator';

const opts = (over: Partial<GeneratorOptions> = {}): GeneratorOptions => ({
  ...DEFAULT_GENERATOR_OPTIONS,
  ...over,
});

describe('generatePassword', () => {
  it('respeta la longitud pedida (y la acota al rango)', () => {
    expect(generatePassword(opts({ length: 24 }))).toHaveLength(24);
    expect(generatePassword(opts({ length: 2 }))).toHaveLength(GENERATOR_LENGTH.min);
    expect(generatePassword(opts({ length: 999 }))).toHaveLength(GENERATOR_LENGTH.max);
  });

  it('incluye al menos un carácter de cada categoría seleccionada', () => {
    const pw = generatePassword(opts({ length: 24, uppercase: true, numbers: true, symbols: true }));
    expect(pw).toMatch(/[a-z]/);
    expect(pw).toMatch(/[A-Z]/);
    expect(pw).toMatch(/[0-9]/);
    expect(pw).toMatch(/[^a-zA-Z0-9]/);
  });

  it('solo minúsculas cuando todo lo demás está apagado', () => {
    const pw = generatePassword(opts({ length: 30, uppercase: false, numbers: false, symbols: false }));
    expect(pw).toMatch(/^[a-z]+$/);
  });

  it('evita caracteres ambiguos cuando se pide', () => {
    for (let i = 0; i < 20; i++) {
      const pw = generatePassword(opts({ length: 40, avoidAmbiguous: true }));
      expect(pw).not.toMatch(/[lI1O0o|`]/);
    }
  });

  it('produce contraseñas distintas en llamadas sucesivas', () => {
    const a = generatePassword(opts());
    const b = generatePassword(opts());
    expect(a).not.toEqual(b);
  });
});

describe('entropyBits / strength', () => {
  it('más opciones y más longitud → más bits', () => {
    const few = entropyBits(opts({ length: 12, uppercase: false, numbers: false, symbols: false }));
    const many = entropyBits(opts({ length: 24, uppercase: true, numbers: true, symbols: true }));
    expect(many).toBeGreaterThan(few);
  });

  it('clasifica la fuerza por bits', () => {
    expect(strengthFromBits(30)).toBe('weak');
    expect(strengthFromBits(60)).toBe('medium');
    expect(strengthFromBits(90)).toBe('strong');
  });
});
