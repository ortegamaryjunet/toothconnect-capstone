import axios from 'axios';

const PRODUCTION_API_URL = 'https://api.smileempressdentalhub.com/api';
const LOCAL_API_URL = 'http://localhost:4000/api';

function resolveApiBaseURL() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (typeof window === 'undefined') {
    return configuredUrl || PRODUCTION_API_URL;
  }

  const hostname = String(window.location.hostname || '').toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  if (!configuredUrl) {
    return isLocalhost ? LOCAL_API_URL : PRODUCTION_API_URL;
  }

  const configuredHostname = (() => {
    try {
      return new URL(configuredUrl).hostname.toLowerCase();
    } catch {
      return '';
    }
  })();

  if (!isLocalhost && (configuredHostname === 'localhost' || configuredHostname === '127.0.0.1')) {
    return PRODUCTION_API_URL;
  }

  return configuredUrl;
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  withCredentials: true,
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
          refreshPromise = api.post('/auth/refresh', { platform: 'web' })
            .then((res) => {
              setAccessToken(res.data.accessToken);
              return res.data.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onAuthChange(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
