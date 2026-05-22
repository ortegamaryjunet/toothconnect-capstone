import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/[\\/]+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-App-OS': Platform.OS === 'ios' ? 'iOS' : 'Android',
  },
});

let accessToken = null;
let refreshPromise = null;
let onAuthChange = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setOnAuthChange(callback) {
  onAuthChange = callback;
}

export async function saveRefreshToken(token) {
  await SecureStore.setItemAsync('refresh_token', token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync('refresh_token');
}

export async function clearRefreshToken() {
  await SecureStore.deleteItemAsync('refresh_token');
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/refresh') ||
                           originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');
            const res = await api.post('/auth/refresh', { platform: 'mobile', refreshToken });
            setAccessToken(res.data.accessToken);
            if (res.data.refreshToken) {
              await saveRefreshToken(res.data.refreshToken);
            }
            return res.data.accessToken;
          })().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        await clearRefreshToken();
        onAuthChange(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
