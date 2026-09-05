import { createBrowserAuthStorage } from '@/src/auth/browserStorage';
import { createAuthedApi } from './api';

describe('authenticated API client', () => {
  it('can attach a browser-stored token without calling native secure storage', async () => {
    const values = new Map([['budgetbounder.token', 'browser-token']]);
    const storage = createBrowserAuthStorage(() => ({
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: key => values.delete(key),
    }));
    const client = createAuthedApi('https://example.test/api', storage);

    const response = await client.get('/probe', {
      adapter: async config => ({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
    });

    expect(response.config.headers.Authorization).toBe('Bearer browser-token');
  });
});
