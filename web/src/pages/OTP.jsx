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
  const [noticeMessage, setNoticeMessage] = useState('');
  const [currentCodeExhausted, setCurrentCodeExhausted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(null);
  const [showCancelOtpPrompt, setShowCancelOtpPrompt] = useState(false);
  const inputRefs = useRef([]);
  const attemptsRemaining = Math.max(0, MAX_VERIFY_ATTEMPTS - verifyAttempts);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (redirectCountdown === null) return undefined;
    if (redirectCountdown <= 0) {
      const isAdminRegisterOtp = purpose === 'admin-register';
      const cooldownMessage = isAdminRegisterOtp
        ? 'Too many failed attempts. Please wait 10 minutes before trying to register an admin account again.'
        : 'Too many failed attempts. Please wait 10 minutes before trying to reset your password again.';
      const cooldownUntil = Date.now() + 10 * 60 * 1000;
      navigate('/login', {
        replace: true,
        state: {
          message: cooldownMessage,
          messageType: 'error',
          email: String(email || '').trim(),
          forgotPasswordCooldownEmail: isAdminRegisterOtp ? '' : String(email || '').trim(),
          forgotPasswordCooldownUntil: isAdminRegisterOtp ? null : cooldownUntil,
          adminRegisterCooldownEmail: isAdminRegisterOtp ? String(email || '').trim() : '',
          adminRegisterCooldownUntil: isAdminRegisterOtp ? cooldownUntil : null,
        },
      });
      return undefined;
    }

    const timeout = setTimeout(() => setRedirectCountdown((current) => Math.max(0, Number(current || 0) - 1)), 1000);
    return () => clearTimeout(timeout);
  }, [redirectCountdown, email, navigate, purpose]);

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
    setNoticeMessage('');
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
        await api.post('/auth/reset-password/verify', { email, code, platform: 'web' });
        navigate('/resetpassword', { state: { email, code } });
      }
    } catch (err) {
      const nextAttempts = verifyAttempts + 1;
      setVerifyAttempts(nextAttempts);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
      const responseMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      const isLockableOtp = purpose === 'reset_password' || purpose === 'admin-register';
      const usedAllResends = resendCount >= MAX_RESENDS;
      const usedAllVerifyAttempts = nextAttempts >= MAX_VERIFY_ATTEMPTS;
      const isOtpLocked =
        isLockableOtp &&
        (
          err.response?.status === 429 ||
          err.response?.data?.locked ||
          (usedAllResends && (usedAllVerifyAttempts || err.response?.data?.code_exhausted))
        );

      if (isOtpLocked) {
        setCurrentCodeExhausted(true);
        setResendCount(MAX_RESENDS);
        const cooldownUntil = err.response?.data?.cooldown_until
          ? new Date(err.response.data.cooldown_until).getTime()
          : Date.now() + 10 * 60 * 1000;
        try {
          window.localStorage.setItem(purpose === 'admin-register' ? 'adminRegisterCooldown' : 'forgotPasswordCooldown', JSON.stringify({
            email: String(email || '').trim(),
            until: Number.isFinite(cooldownUntil) ? cooldownUntil : Date.now() + 10 * 60 * 1000,
          }));
        } catch {
          // Ignore storage errors; backend still enforces cooldown.
        }
        setError('OTP verification failed. Too many incorrect attempts. You will be redirected to the login page in 5 seconds.');
        setRedirectCountdown(5);
      } else if (err.response?.data?.code_exhausted) {
        setCurrentCodeExhausted(true);
        setVerifyAttempts(MAX_VERIFY_ATTEMPTS);
        setError(responseMessage);
      } else if (usedAllVerifyAttempts) {
        setError(responseMessage);
      } else {
        setError(responseMessage);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (resendCount >= MAX_RESENDS) return;

    setResending(true);
    setError('');
    setNoticeMessage('');
    try {
      if (purpose === 'admin-register') {
        await api.post('/auth/admin-register/start', { name, email, password });
      } else {
        await api.post('/auth/forgot-password', { email, platform: 'web' });
      }
      setResendCount((c) => c + 1);
      setVerifyAttempts(0);
      setCurrentCodeExhausted(false);
      setTimer(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setNoticeMessage(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  }

  function openCancelOtpPrompt() {
    setShowCancelOtpPrompt(true);
  }

  function closeCancelOtpPrompt() {
    setShowCancelOtpPrompt(false);
  }

  function confirmCancelOtp() {
    setShowCancelOtpPrompt(false);
    navigate('/login', { replace: true });
  }

  if (!email || !purpose) return null;

  const resendRemaining = MAX_RESENDS - resendCount;
  const isPasswordResetOtp = purpose === 'reset_password';
  const cancelOtpTitle = isPasswordResetOtp ? 'Cancel Password Reset' : 'Cancel Verification';
  const cancelOtpMessage = isPasswordResetOtp
    ? 'Are you sure you want to cancel password reset and go back to login?'
    : 'Are you sure you want to cancel OTP verification and go back to login?';
  const otpNoticeMessage = redirectCountdown !== null
    ? `Redirecting to login in ${redirectCountdown} second${redirectCountdown === 1 ? '' : 's'}.`
    : noticeMessage ||
      (currentCodeExhausted
        ? resendCount < MAX_RESENDS
          ? 'This code has no verification attempts left. Please resend a new code to continue.'
          : 'OTP resend limit reached.'
        : attemptsRemaining > 0
        ? `You have ${attemptsRemaining} OTP verification attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
        : resendCount >= MAX_RESENDS
          ? 'OTP resend limit reached.'
          : 'No OTP verification attempts remaining.');

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>OTP Verification</h1>
        <p style={styles.subtitle}>
          Enter the 6-digit code sent to <strong>{email}</strong>.
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {otpNoticeMessage && (
          <div style={verifyAttempts > 0 || redirectCountdown !== null ? styles.attemptsWarning : styles.attemptsNotice}>
            {otpNoticeMessage}
          </div>
        )}

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
            disabled={submitting || currentCodeExhausted || redirectCountdown !== null}
            style={{ ...styles.button, ...((submitting || currentCodeExhausted || redirectCountdown !== null) ? styles.buttonDisabled : {}) }}
          >
            {submitting ? 'Verifying...' : 'Submit'}
          </button>
        </form>

        <button
          style={styles.backButton}
          onClick={openCancelOtpPrompt}
        >
          Back to Login
        </button>
      </div>

      {showCancelOtpPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeCancelOtpPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>{cancelOtpTitle}</h2>
            <p style={styles.modalText}>
              {cancelOtpMessage}
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.cancelBtn }}
                onClick={closeCancelOtpPrompt}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.saveBtn }}
                onClick={confirmCancelOtp}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
