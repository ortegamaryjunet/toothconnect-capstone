import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken, setOnAuthChange } from '../api/axios';

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
      const refreshRes = await api.post('/auth/refresh', { platform: 'web' });
      setAccessToken(refreshRes.data.accessToken);
      const meRes = await api.get('/auth/me');
      setUser({
        id: meRes.data.id,
        role: meRes.data.role,
        name: meRes.data.name,
        email: meRes.data.email,
        home_branch_id: meRes.data.home_branch_id,
        branches: meRes.data.branches,
        must_change_password: meRes.data.must_change_password,
      });
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password, platform: 'web' });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout', { platform: 'web' });
    } catch (err) {
      // even if backend logout fails, clear local state
    }
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
