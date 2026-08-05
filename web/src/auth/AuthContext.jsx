import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api, { setAccessToken, setOnAuthChange } from '../api/axios';

const AuthContext = createContext(null);
const WEB_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const bootstrap = useCallback(async () => {
    try {
      const refreshRes = await api.post('/auth/refresh', { platform: 'web' });
      setAccessToken(refreshRes.data.accessToken);
      const meRes = await api.get('/auth/me');
      setUser({
        id: meRes.data.id,
        role: meRes.data.role,
        name: meRes.data.name,
        email: meRes.data.email,
        profilePhotoUrl: meRes.data.profile_photo_url || '',
        home_branch_id: meRes.data.home_branch_id,
        branches: meRes.data.branches,
        must_change_password: meRes.data.must_change_password,
      });
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnAuthChange(setUser);
    const timeout = window.setTimeout(() => {
      bootstrap();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [bootstrap]);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password, platform: 'web' });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', { platform: 'web' });
    } catch {
      // even if backend logout fails, clear local state
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return undefined;
    }

    function resetInactivityTimer() {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        logout();
      }, WEB_INACTIVITY_TIMEOUT_MS);
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'focus'];
    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [logout, user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
