/* eslint-disable */
// Mocks de módulos nativos de Expo para los tests del núcleo de cripto.
// El cripto es JS puro; solo necesitamos aleatoriedad real y un secure-store
// en memoria para poder ejecutarlo bajo Node.
jest.mock('expo-crypto', () => ({
  getRandomBytes: (length) => {
    const bytes = new Uint8Array(length);
    require('crypto').randomFillSync(bytes);
    return bytes;
  },
}));

jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    setItemAsync: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    deleteItemAsync: jest.fn(async (key) => {
      store.delete(key);
    }),
  };
});
