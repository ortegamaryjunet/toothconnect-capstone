import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import createForgotPasswordStyles from '../styles/ForgotPassword';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 520;
  const styles = createForgotPasswordStyles({ isMobile });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [confirm, setConfirm] = useState(null); // { email, role }
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setChecking(true);
    try {
      const { data } = await api.post('/auth/check-email', { email: email.trim() });
      setConfirm({ email: email.trim(), role: data.role });
    } catch (err) {
      setError(err.response?.data?.message || 'Email does not exist.');
    } finally {
      setChecking(false);
    }
  }

  async function handleConfirmYes() {
    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email: confirm.email, platform: 'web' });
      navigate('/otp', {
        state: { email: confirm.email, purpose: 'reset_password' },
      });
    } catch (err) {
      setConfirm(null);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleConfirmNo() {
    setConfirm(null);
  }

  return (
    <div style={styles.page}>
      {confirm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Confirm Email Address</h2>
            <p style={styles.modalSubtitle}>Is this the correct email address?</p>
            <div style={styles.modalEmailBox}>
              <span style={styles.modalEmail}>{confirm.email}</span>
              <span style={styles.modalRole}>({confirm.role})</span>
            </div>
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalButtonYes, ...(sending ? styles.buttonDisabled : {}) }}
                onClick={handleConfirmYes}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Yes, Send Code'}
              </button>
              <button
                style={styles.modalButtonNo}
                onClick={handleConfirmNo}
                disabled={sending}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we will send you a verification code.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          name="email"
          placeholder="Email address"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={checking}
          style={{ ...styles.button, ...(checking ? styles.buttonDisabled : {}) }}
        >
          {checking ? 'Checking...' : 'Send Code'}
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
