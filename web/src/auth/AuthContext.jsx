import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);
const WEB_INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const PUBLIC_AUTH_PATHS = new Set([
  '/login',
  '/register',
  '/forgotpassword',
  '/otp',
  '/resetpassword',
]);

async function getAuthApi() {
  return import('../api/axios');
}

function isPublicAuthPath() {
  if (typeof window === 'undefined') return false;
  return PUBLIC_AUTH_PATHS.has(window.location.pathname.toLowerCase());
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const bootstrap = useCallback(async () => {
    if (isPublicAuthPath()) {
      const { setAccessToken } = await getAuthApi();
      setAccessToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { default: api, setAccessToken } = await getAuthApi();
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
      const { setAccessToken } = await getAuthApi();
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      getAuthApi().then(({ setOnAuthChange }) => {
        setOnAuthChange(setUser);
      });
      bootstrap();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [bootstrap]);

  async function login(email, password) {
    const { default: api, setAccessToken } = await getAuthApi();
    const res = await api.post('/auth/login', { email, password, platform: 'web' });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }

  const logout = useCallback(async () => {
    try {
      const { default: api } = await getAuthApi();
      await api.post('/auth/logout', { platform: 'web' });
    } catch {
      // even if backend logout fails, clear local state
    }
    const { setAccessToken } = await getAuthApi();
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
