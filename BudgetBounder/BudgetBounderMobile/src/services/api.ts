import { create } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { resolveApiUrl } from './apiUrl';

export const API_URL = resolveApiUrl(
  Platform.OS,
  process.env.EXPO_PUBLIC_API_URL,
  Constants.expoConfig?.hostUri,
);

const api = create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('budgetbounder.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
