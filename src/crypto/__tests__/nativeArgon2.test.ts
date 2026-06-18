import { argon2id } from '@noble/hashes/argon2.js';
import {
  deriveMasterKey,
  deriveMasterKeyAsync,
  registerNativeArgon2,
  type Argon2Params,
  type NativeArgon2,
} from '../kdf';
import { bytesToHex } from '../encoding';

const FAST: Argon2Params = { t: 1, m: 256, p: 1, dkLen: 32 };
const salt = new Uint8Array(16).fill(9);

/** Un "nativo" correcto = Argon2id real (idéntico a @noble por ser estándar). */
const goodNative: NativeArgon2 = async (pw, s, params) =>
  argon2id(pw, s, { t: params.t, m: params.m, p: params.p, dkLen: params.dkLen });

/** Un "nativo" roto: devuelve bytes que no coinciden con @noble. */
const badNative: NativeArgon2 = async () => new Uint8Array(32); // todo ceros

afterEach(() => registerNativeArgon2(null));

describe('Argon2id nativo (self-test + fallback)', () => {
  it('sin nativo registrado, deriva con @noble', async () => {
    const got = await deriveMasterKeyAsync('clave', salt, FAST);
    expect(bytesToHex(got)).toEqual(bytesToHex(deriveMasterKey('clave', salt, FAST)));
  });

  it('usa el nativo cuando pasa el self-test (mismo resultado que @noble)', async () => {
    const spy = jest.fn(goodNative);
    registerNativeArgon2(spy);

    const got = await deriveMasterKeyAsync('clave', salt, FAST);

    expect(bytesToHex(got)).toEqual(bytesToHex(deriveMasterKey('clave', salt, FAST)));
    expect(spy).toHaveBeenCalled(); // se usó el nativo (self-test + derivación)
  });

  it('ignora un nativo incompatible y cae a @noble (no bloquea al usuario)', async () => {
    registerNativeArgon2(badNative);

    const got = await deriveMasterKeyAsync('clave', salt, FAST);

    // Resultado correcto (de @noble), NO los ceros del nativo roto.
    expect(bytesToHex(got)).toEqual(bytesToHex(deriveMasterKey('clave', salt, FAST)));
    expect(bytesToHex(got)).not.toEqual(bytesToHex(new Uint8Array(32)));
  });
});
