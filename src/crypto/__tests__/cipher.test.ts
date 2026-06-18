import {
  decryptBytes,
  decryptString,
  encryptBytes,
  encryptString,
  IV_LENGTH,
  KEY_LENGTH,
} from '../cipher';
import { utf8ToBytes } from '../encoding';

function key(fill = 5): Uint8Array {
  return new Uint8Array(KEY_LENGTH).fill(fill);
}

describe('cipher (AES-256-GCM)', () => {
  it('round-trip de bytes: encrypt → decrypt devuelve el original', () => {
    const k = key();
    const plaintext = utf8ToBytes('datos secretos 🔐');
    const blob = encryptBytes(k, plaintext);
    expect(blob.iv).toHaveLength(IV_LENGTH);
    expect(decryptBytes(k, blob)).toEqual(plaintext);
  });

  it('round-trip de string', () => {
    const k = key();
    const packed = encryptString(k, 'mi contraseña súper secreta');
    expect(decryptString(k, packed)).toEqual('mi contraseña súper secreta');
  });

  it('usa un IV aleatorio distinto en cada cifrado (no determinista)', () => {
    const k = key();
    const a = encryptString(k, 'mismo texto');
    const b = encryptString(k, 'mismo texto');
    expect(a).not.toEqual(b);
    expect(decryptString(k, a)).toEqual(decryptString(k, b));
  });

  it('falla al descifrar con una clave incorrecta', () => {
    const packed = encryptString(key(1), 'top secret');
    expect(() => decryptString(key(2), packed)).toThrow();
  });

  it('falla si el ciphertext fue manipulado (autenticación GCM)', () => {
    const k = key();
    const blob = encryptBytes(k, utf8ToBytes('integridad'));
    blob.ciphertext[0] ^= 0xff;
    expect(() => decryptBytes(k, blob)).toThrow();
  });

  it('soporta AAD: descifrar requiere el mismo AAD', () => {
    const k = key();
    const aad = utf8ToBytes('item-id-123');
    const blob = encryptBytes(k, utf8ToBytes('con aad'), aad);
    expect(decryptBytes(k, blob, aad)).toEqual(utf8ToBytes('con aad'));
    expect(() => decryptBytes(k, blob, utf8ToBytes('otro-aad'))).toThrow();
  });

  it('rechaza claves que no sean de 32 bytes', () => {
    expect(() => encryptBytes(new Uint8Array(16), utf8ToBytes('x'))).toThrow(RangeError);
  });
});
