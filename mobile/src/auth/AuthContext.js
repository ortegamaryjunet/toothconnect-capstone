import { createContext, useContext, useEffect, useState } from 'react';
import api, {
  setAccessToken,
  setOnAuthChange,
  saveRefreshToken,
  getRefreshToken,
  clearRefreshToken,
} from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOnAuthChange(setUser);
    bootstrap();
  }, []);

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
        branches: meRes.data.branches,
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
    return res.data.user;
  }

  async function registerStart(email, name, password) {
    await api.post('/auth/register/start', { email, name, password });
  }

  async function registerVerify(email, code) {
    const res = await api.post('/auth/register/verify', { email, code, platform: 'mobile' });
    setAccessToken(res.data.accessToken);
    await saveRefreshToken(res.data.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
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