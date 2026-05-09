import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const redirectTo = roleHomePath(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>ToothConnect</h1>
        <p style={styles.subtitle}>Staff sign-in</p>

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

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={styles.note}>Patients use the mobile app.</p>
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

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f6f8',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  form: {
    background: '#fff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: { margin: 0, fontSize: '24px', color: '#1a365d' },
  subtitle: { margin: '4px 0 24px', color: '#718096', fontSize: '14px' },
  label: { fontSize: '12px', color: '#4a5568', marginBottom: '4px' },
  input: {
    padding: '10px 12px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  button: {
    background: '#3182ce',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  error: {
    background: '#fed7d7',
    color: '#9b2c2c',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '12px',
  },
  note: {
    fontSize: '12px',
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: '16px',
  },
};