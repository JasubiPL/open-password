import { decryptString, encryptString, KEY_LENGTH } from '../cipher';
import {
  clearVaultKey,
  deleteVaultKeyFromSecureStore,
  generateVaultKey,
  getVaultKey,
  isUnlocked,
  loadVaultKeyFromSecureStore,
  protectVaultKey,
  saveVaultKeyToSecureStore,
  setVaultKey,
  unprotectVaultKey,
} from '../keyManager';
import { bytesToHex } from '../encoding';

const masterKey = new Uint8Array(KEY_LENGTH).fill(42);

afterEach(() => {
  clearVaultKey();
});

describe('keyManager', () => {
  it('genera una Vault Key AES-256 aleatoria', () => {
    const a = generateVaultKey();
    const b = generateVaultKey();
    expect(a).toHaveLength(KEY_LENGTH);
    expect(bytesToHex(a)).not.toEqual(bytesToHex(b));
  });

  it('protege y desprotege la Vault Key con la Master Key (round-trip)', () => {
    const vaultKey = generateVaultKey();
    const wrapped = protectVaultKey(vaultKey, masterKey);
    const unwrapped = unprotectVaultKey(wrapped, masterKey);
    expect(bytesToHex(unwrapped)).toEqual(bytesToHex(vaultKey));
  });

  it('falla al desproteger con una Master Key incorrecta', () => {
    const wrapped = protectVaultKey(generateVaultKey(), masterKey);
    const wrongKey = new Uint8Array(KEY_LENGTH).fill(7);
    expect(() => unprotectVaultKey(wrapped, wrongKey)).toThrow();
  });

  it('una Vault Key desprotegida puede cifrar/descifrar datos', () => {
    const vaultKey = generateVaultKey();
    const wrapped = protectVaultKey(vaultKey, masterKey);
    const recovered = unprotectVaultKey(wrapped, masterKey);
    const blob = encryptString(recovered, 'entrada de la bóveda');
    expect(decryptString(vaultKey, blob)).toEqual('entrada de la bóveda');
  });

  it('gestiona el estado de bloqueo en RAM', () => {
    expect(isUnlocked()).toBe(false);
    expect(() => getVaultKey()).toThrow();

    const vaultKey = generateVaultKey();
    setVaultKey(vaultKey);
    expect(isUnlocked()).toBe(true);
    expect(getVaultKey()).toBe(vaultKey);

    clearVaultKey();
    expect(isUnlocked()).toBe(false);
    expect(() => getVaultKey()).toThrow();
  });

  it('persiste y recupera la Vault Key del secure store', async () => {
    expect(await loadVaultKeyFromSecureStore()).toBeNull();

    const vaultKey = generateVaultKey();
    await saveVaultKeyToSecureStore(vaultKey);
    const loaded = await loadVaultKeyFromSecureStore();
    expect(loaded).not.toBeNull();
    expect(bytesToHex(loaded!)).toEqual(bytesToHex(vaultKey));

    await deleteVaultKeyFromSecureStore();
    expect(await loadVaultKeyFromSecureStore()).toBeNull();
  });
});
