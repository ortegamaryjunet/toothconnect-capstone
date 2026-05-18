import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import createRegisterStyles from '../styles/Register';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

export default function Register() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 520;
  const styles = createRegisterStyles({ isMobile });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return setError('Password must not contain special characters.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return setError('Password must contain at least one letter and one number.');
    }

    setSubmitting(true);
    try {
      await api.post('/auth/admin-register/start', { name: name.trim(), email: email.trim(), password });
      navigate('/otp', {
        state: { email: email.trim(), name: name.trim(), password, purpose: 'admin-register' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>Admin Registration</h1>
        <p style={styles.subtitle}>
          Create an admin account for Smile Empress Dental Hub.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label style={styles.label}>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email address"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="At least 8 characters, letters and numbers only"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label style={styles.label}>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password"
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
          {submitting ? 'Sending OTP...' : 'Register'}
        </button>

        <p style={styles.note}>
          Already have an account?{' '}
          <span style={styles.link} onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
