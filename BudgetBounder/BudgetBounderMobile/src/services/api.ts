import { create } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AuthStorage from '@/src/auth/authStorage';
import { resolveApiUrl } from './apiUrl';

export const API_URL = resolveApiUrl(
  Platform.OS,
  process.env.EXPO_PUBLIC_API_URL,
  Constants.expoConfig?.hostUri,
);

type TokenStorage = {
  getItemAsync(key: string): Promise<string | null>;
};

export function createAuthedApi(baseURL: string, storage: TokenStorage) {
  const client = create({ baseURL });

  client.interceptors.request.use(async (config) => {
    const token = await storage.getItemAsync('budgetbounder.token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return client;
}

const api = createAuthedApi(API_URL, AuthStorage);

export default api;
