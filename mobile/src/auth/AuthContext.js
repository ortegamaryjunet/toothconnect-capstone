import { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import api, {
  setAccessToken,
  setOnAuthChange,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from '../api/axios';
import { registerForPushNotificationsAsync, clearPushToken } from '../services/push';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnAuthChange(setUser);
    bootstrap();
  }, []);

  useEffect(() => {
    if (loading || !user) return undefined;

    let cancelled = false;

    async function registerPush(reason) {
      try {
        const result = await registerForPushNotificationsAsync();
        if (!cancelled) {
          console.log(`[push] Registration ${reason}:`, result);
        }
      } catch (err) {
        if (!cancelled) {
          console.log(`[push] Registration failed ${reason}:`, err.message);
        }
      }
    }

    const timer = setTimeout(() => registerPush('after user session ready'), 500);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        registerPush('after app became active');
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      subscription.remove();
    };
  }, [loading, user?.id]);

  async function bootstrap() {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        setLoading(false);
        return;
      }
      const refreshRes = await api.post('/auth/refresh', { platform: 'mobile', refreshToken });
      setAccessToken(refreshRes.data.accessToken);
      if (refreshRes.data.refreshToken) {
        await saveRefreshToken(refreshRes.data.refreshToken);
      }
      const meRes = await api.get('/auth/me');
      setUser({
        id: meRes.data.id,
        role: meRes.data.role,
        name: meRes.data.name,
        email: meRes.data.email,
        home_branch_id: meRes.data.home_branch_id ?? null,
        home_branch_city: meRes.data.home_branch_city ?? null,
        branches: meRes.data.branches,
        created_at: meRes.data.created_at ?? null,
      });
      registerForPushNotificationsAsync().catch(err => {
        console.log('[push] Registration failed during bootstrap:', err.message);
      });
    } catch (err) {
      await clearRefreshToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password, platform: 'mobile' });
    setAccessToken(res.data.accessToken);
    await saveRefreshToken(res.data.refreshToken);
    setUser(res.data.user);
    registerForPushNotificationsAsync().catch(err => {
      console.log('[push] Registration failed during login:', err.message);
    });
    return res.data.user;
  }

  async function registerStart(email, name, password, branch_id) {
    await api.post('/auth/register/start', { email, name, password, branch_id });
  }

  async function registerVerify(email, code) {
  const res = await api.post('/auth/register/verify', { email, code, platform: 'mobile' });
  // Standard flow: don't auto-login. User navigates to login screen.
  return res.data;
}

  async function logout() {
    try {
      await clearPushToken();
    } catch (err) {
      // ignore
    }
    try {
      const refreshToken = await getRefreshToken();
      await api.post('/auth/logout', { platform: 'mobile', refreshToken });
    } catch (err) {
      // ignore
    }
    setAccessToken(null);
    await clearRefreshToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, registerStart, registerVerify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
