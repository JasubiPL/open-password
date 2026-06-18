import {
  deriveAuthHash,
  deriveMasterKey,
  generateSalt,
  SALT_LENGTH,
  type Argon2Params,
} from '../kdf';
import { bytesToHex } from '../encoding';

// Parámetros reducidos para que Argon2id corra rápido en los tests.
const FAST_PARAMS: Argon2Params = { t: 2, m: 256, p: 1, dkLen: 32 };

describe('kdf', () => {
  it('genera salts del tamaño esperado y distintos entre sí', () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).toHaveLength(SALT_LENGTH);
    expect(bytesToHex(a)).not.toEqual(bytesToHex(b));
  });

  it('deriveMasterKey es determinista para (password, salt, params)', () => {
    const salt = new Uint8Array(16).fill(9);
    const k1 = deriveMasterKey('correct horse battery staple', salt, FAST_PARAMS);
    const k2 = deriveMasterKey('correct horse battery staple', salt, FAST_PARAMS);
    expect(k1).toHaveLength(32);
    expect(bytesToHex(k1)).toEqual(bytesToHex(k2));
  });

  it('cambia la Master Key si cambia la contraseña o el salt', () => {
    const salt = new Uint8Array(16).fill(1);
    const otherSalt = new Uint8Array(16).fill(2);
    const base = bytesToHex(deriveMasterKey('pw-uno', salt, FAST_PARAMS));
    expect(bytesToHex(deriveMasterKey('pw-dos', salt, FAST_PARAMS))).not.toEqual(base);
    expect(bytesToHex(deriveMasterKey('pw-uno', otherSalt, FAST_PARAMS))).not.toEqual(base);
  });

  it('el auth hash es determinista y distinto de la Master Key', () => {
    const salt = new Uint8Array(16).fill(7);
    const masterKey = deriveMasterKey('clave maestra', salt, FAST_PARAMS);
    const h1 = deriveAuthHash(masterKey, 'clave maestra');
    const h2 = deriveAuthHash(masterKey, 'clave maestra');
    expect(bytesToHex(h1)).toEqual(bytesToHex(h2));
    expect(bytesToHex(h1)).not.toEqual(bytesToHex(masterKey));
  });

  it('normaliza Unicode (NFC vs NFD producen la misma clave)', () => {
    const salt = new Uint8Array(16).fill(3);
    const nfc = 'cañón'.normalize('NFC');
    const nfd = 'cañón'.normalize('NFD');
    expect(nfc).not.toEqual(nfd); // distinta representación de bytes
    const k1 = bytesToHex(deriveMasterKey(nfc, salt, FAST_PARAMS));
    const k2 = bytesToHex(deriveMasterKey(nfd, salt, FAST_PARAMS));
    expect(k1).toEqual(k2);
  });
});
