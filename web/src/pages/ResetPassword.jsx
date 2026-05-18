import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import createResetPasswordStyles from '../styles/ResetPassword';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 520;
  const styles = createResetPasswordStyles({ isMobile });

  const { email, code } = location.state || {};

  useEffect(() => {
    if (!email || !code) {
      navigate('/login', { replace: true });
    }
  }, []);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successful! You may now sign in.' },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      if (msg === 'Invalid code' || msg === 'No valid OTP found') {
        setError('Your verification code is invalid or expired. Please start over.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !code) return null;

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below to update your account.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>New Password</label>
        <input
          type="password"
          placeholder="At least 8 characters"
          style={styles.input}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <label style={styles.label}>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          style={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>

        <p style={styles.note}>
          Remember your password?{' '}
          <span style={styles.link} onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
