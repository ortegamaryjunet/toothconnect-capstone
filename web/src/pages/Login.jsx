import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import createLoginStyles from '../styles/Login.js';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

const styles = createLoginStyles({ isMobile: window.innerWidth < 520 });

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const stateMessage = location.state?.message ?? '';
  const stateMessageType = location.state?.messageType ?? 'success';
  const [banner, setBanner] = useState(stateMessage);
  const [bannerType, setBannerType] = useState(stateMessageType);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(''), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>ToothConnect</h1>
        <p style={styles.subtitle}>Staff sign-in</p>

        {banner && (
          <div style={bannerType === 'error' ? styles.errorBanner : styles.success}>
            {banner}
          </div>
        )}
        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          autoComplete="email"
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          autoComplete="current-password"
        />

        <p style={{ margin: '0 0 18px', textAlign: 'right' }}>
          <span style={styles.link} onClick={() => navigate('/forgotpassword')}>
            Forgot Password?
          </span>
        </p>

        <button
          type="submit"
          disabled={submitting}
          style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={styles.note}>
          No account yet?{' '}
          <span style={styles.link} onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
      </form>
    </div>
  );
}

export function roleHomePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'dentist') return '/dentist';
  if (role === 'receptionist') return '/receptionist';
  return '/login';
}
