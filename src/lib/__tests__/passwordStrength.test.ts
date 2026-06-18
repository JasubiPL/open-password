import {
  estimateStrength,
  isAcceptableMasterPassword,
  MIN_MASTER_PASSWORD_LENGTH,
} from '../passwordStrength';

describe('passwordStrength', () => {
  it('clasifica vacío y cortas como débiles', () => {
    expect(estimateStrength('').level).toBe('weak');
    expect(estimateStrength('abc').level).toBe('weak');
  });

  it('sube de nivel con longitud y variedad de caracteres', () => {
    expect(estimateStrength('abcdefgh').level).toBe('weak'); // 8, una sola clase
    expect(estimateStrength('abcdefgh1').level).toBe('medium'); // 9, dos clases
    expect(estimateStrength('Abcdefg1!xyz').level).toBe('strong'); // 12, varias clases
  });

  it('isAcceptableMasterPassword exige mínimo y no-débil', () => {
    expect(isAcceptableMasterPassword('a'.repeat(MIN_MASTER_PASSWORD_LENGTH - 1))).toBe(false);
    expect(isAcceptableMasterPassword('Str0ng-Pass!')).toBe(true);
  });
});
