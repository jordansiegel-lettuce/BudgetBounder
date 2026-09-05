import { createBrowserAuthStorage } from './browserStorage';

describe('browser auth storage', () => {
  it('persists and removes credentials through the supplied browser storage', async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    const authStorage = createBrowserAuthStorage(() => storage);

    await authStorage.setItemAsync('token', 'demo-token');
    expect(await authStorage.getItemAsync('token')).toBe('demo-token');

    await authStorage.deleteItemAsync('token');
    expect(await authStorage.getItemAsync('token')).toBeNull();
  });

  it('is safe while rendering without a browser window', async () => {
    const authStorage = createBrowserAuthStorage(() => null);

    await expect(authStorage.getItemAsync('token')).resolves.toBeNull();
    await expect(authStorage.setItemAsync('token', 'value')).resolves.toBeUndefined();
    await expect(authStorage.deleteItemAsync('token')).resolves.toBeUndefined();
  });
});
