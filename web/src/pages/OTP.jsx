import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import createOTPStyles from '../styles/OTP';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

const MAX_RESENDS = 3;
const MAX_VERIFY_ATTEMPTS = 3;

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = window.innerWidth < 520;
  const styles = createOTPStyles({ isMobile });

  const { email, name, password, purpose } = location.state || {};

  useEffect(() => {
    if (!email || !purpose) {
      navigate('/login', { replace: true });
    }
  }, []);

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  function handleDigitChange(index, value) {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIndex = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      return setError('Please fill in all 6 OTP digits.');
    }
    setError('');
    setSubmitting(true);

    try {
      if (purpose === 'admin-register') {
        await api.post('/auth/admin-register/verify', { email, code, platform: 'web' });
        navigate('/login', {
          replace: true,
          state: {
            message: 'Registration successful! You may now sign in.',
            messageType: 'success',
            email: String(email || '').trim(),
          },
        });
      } else {
        navigate('/resetpassword', { state: { email, code } });
      }
    } catch (err) {
      const nextAttempts = verifyAttempts + 1;
      setVerifyAttempts(nextAttempts);
      if (nextAttempts >= MAX_VERIFY_ATTEMPTS) {
        setError('Too many failed attempts. Please request a new code.');
      } else {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCount >= MAX_RESENDS) return;

    setResending(true);
    setError('');
    try {
      if (purpose === 'admin-register') {
        await api.post('/auth/admin-register/start', { name, email, password });
      } else {
        await api.post('/auth/forgot-password', { email, platform: 'web' });
      }
      setResendCount((c) => c + 1);
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  }

  if (!email || !purpose) return null;

  const resendRemaining = MAX_RESENDS - resendCount;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>OTP Verification</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <strong>{email}</strong>.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.otpWrapper} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                maxLength="1"
                inputMode="numeric"
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                style={styles.otpInput}
              />
            ))}
          </div>

          {timer > 0 ? (
            <p style={styles.timer}>
              Request a new code in <span style={styles.timerStrong}>{timer}</span> seconds.
            </p>
          ) : (
            <p style={styles.resendText}>
              Didn&apos;t receive the code?{' '}
              <span
                style={
                  resending || resendCount >= MAX_RESENDS
                    ? { ...styles.link, opacity: 0.4, pointerEvents: 'none', cursor: 'default' }
                    : styles.link
                }
                onClick={!resending && resendCount < MAX_RESENDS ? handleResend : undefined}
              >
                {resending
                  ? 'Sending...'
                  : resendCount < MAX_RESENDS
                  ? `Resend Code (${resendRemaining} left)`
                  : 'Resend limit reached'}
              </span>
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || verifyAttempts >= MAX_VERIFY_ATTEMPTS}
            style={{ ...styles.button, ...((submitting || verifyAttempts >= MAX_VERIFY_ATTEMPTS) ? styles.buttonDisabled : {}) }}
          >
            {submitting ? 'Verifying...' : 'Submit'}
          </button>
        </form>

        <button
          style={styles.backButton}
          onClick={() => navigate('/login', { replace: true })}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
