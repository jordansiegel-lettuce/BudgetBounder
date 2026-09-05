export type BrowserKeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): unknown;
  removeItem(key: string): unknown;
};

export function createBrowserAuthStorage(
  getStorage: () => BrowserKeyValueStorage | null,
) {
  return {
    async getItemAsync(key: string) {
      return getStorage()?.getItem(key) ?? null;
    },
    async setItemAsync(key: string, value: string) {
      getStorage()?.setItem(key, value);
    },
    async deleteItemAsync(key: string) {
      getStorage()?.removeItem(key);
    },
  };
}
