import { clearVaultKey, KEY_LENGTH, setVaultKey } from '@/crypto';
import { decryptRecord, encryptRecord } from '../vaultCrypto';

beforeEach(() => {
  clearVaultKey();
  setVaultKey(new Uint8Array(KEY_LENGTH).fill(11));
});

describe('vaultCrypto', () => {
  it('cifra y descifra un registro (round-trip)', () => {
    const record = { title: 'Gmail', username: 'me@x.com', password: 's3cr3t', notes: 'áéí 🔐' };
    const blob = encryptRecord(record);
    expect(typeof blob).toBe('string');
    expect(blob).not.toContain('Gmail'); // está cifrado
    expect(decryptRecord(blob)).toEqual(record);
  });

  it('produce blobs distintos para el mismo registro (IV aleatorio)', () => {
    const record = { name: 'Personal', icon: 'home', color: '#fff' };
    expect(encryptRecord(record)).not.toEqual(encryptRecord(record));
  });

  it('falla al descifrar con otra Vault Key', () => {
    const blob = encryptRecord({ a: 1 });
    setVaultKey(new Uint8Array(KEY_LENGTH).fill(99));
    expect(() => decryptRecord(blob)).toThrow();
  });

  it('lanza si la bóveda está bloqueada', () => {
    clearVaultKey();
    expect(() => encryptRecord({ a: 1 })).toThrow();
  });
});
