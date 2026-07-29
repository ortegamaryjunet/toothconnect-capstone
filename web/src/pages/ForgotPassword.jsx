import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import createForgotPasswordStyles from '../styles/ForgotPassword';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 520;
  const styles = createForgotPasswordStyles({ isMobile });

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [confirm, setConfirm] = useState(null); // { email, role }
  const [sending, setSending] = useState(false);
  const [showCancelPasswordPrompt, setShowCancelPasswordPrompt] = useState(false);
  const emailRef = useRef(null);

  const visibleEmailError = (emailTouched || submittedOnce) ? emailError : '';

  function validateEmail(value) {
    const trimmedEmail = String(value || '').trim();
    if (!trimmedEmail) return 'This field is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Email format is invalid';
    }
    return '';
  }

  function handleEmailChange(value) {
    const previousValue = email;
    setEmail(value);

    const shouldShowRequiredError =
      !String(value || '').trim() &&
      (String(value || '').length > 0 || String(previousValue || '').length > 0);

    if (shouldShowRequiredError) {
      setEmailTouched(true);
    }

    if (emailTouched || submittedOnce || shouldShowRequiredError) {
      setEmailError(validateEmail(value));
    }
  }

  function handleEmailBlur() {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  }

  function showRequiredEmailError() {
    setEmailTouched(true);
    setEmailError('This field is required');
  }

  function handleRequiredKeyDown(event) {
    const value = event.currentTarget.value || '';
    const selectionStart = event.currentTarget.selectionStart ?? value.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;

    if (event.key === ' ' && !value.trim()) {
      showRequiredEmailError();
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const nextValue =
        event.key === 'Backspace'
          ? value.slice(0, selectionStart === selectionEnd ? Math.max(0, selectionStart - 1) : selectionStart) + value.slice(selectionEnd)
          : value.slice(0, selectionStart) + value.slice(selectionStart === selectionEnd ? selectionEnd + 1 : selectionEnd);

      if (!nextValue.trim()) {
        showRequiredEmailError();
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmittedOnce(true);

    const nextEmailError = validateEmail(email);
    setEmailTouched(true);
    setEmailError(nextEmailError);

    if (nextEmailError) {
      emailRef.current?.focus();
      return;
    }

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
      if (err.response?.status === 429 && err.response?.data?.retry_after_seconds) {
        const cooldownUntil = Date.now() + Number(err.response.data.retry_after_seconds || 0) * 1000;
        try {
          window.localStorage.setItem('forgotPasswordCooldown', JSON.stringify({
            email: String(confirm.email || '').trim(),
            until: cooldownUntil,
          }));
        } catch {
          // Ignore storage errors; backend still enforces cooldown.
        }
        navigate('/login', {
          replace: true,
          state: {
            message: err.response.data.message || 'Too many failed attempts. Please wait 10 minutes before trying to reset your password again.',
            messageType: 'error',
            email: String(confirm.email || '').trim(),
            forgotPasswordCooldownEmail: String(confirm.email || '').trim(),
            forgotPasswordCooldownUntil: cooldownUntil,
          },
        });
        return;
      }
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleConfirmNo() {
    setConfirm(null);
  }

  function openCancelPasswordPrompt() {
    setShowCancelPasswordPrompt(true);
  }

  function closeCancelPasswordPrompt() {
    setShowCancelPasswordPrompt(false);
  }

  function confirmCancelPasswordReset() {
    setShowCancelPasswordPrompt(false);
    navigate('/login');
  }

  return (
    <div style={styles.page}>
      {showCancelPasswordPrompt && (
        <div style={styles.confirmOverlay} onClick={(e) => { if (e.target === e.currentTarget) closeCancelPasswordPrompt(); }}>
          <div style={styles.confirmModal}>
            <div style={styles.confirmModalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.confirmModalIconText}></i>
            </div>
            <h2 style={styles.confirmModalTitle}>Cancel Password Reset</h2>
            <p style={styles.confirmModalText}>
              Are you sure you want to cancel password reset and go back to login?
            </p>
            <div style={styles.confirmModalActions}>
              <button
                type="button"
                style={{ ...styles.confirmModalButton, ...styles.confirmCancelBtn }}
                onClick={closeCancelPasswordPrompt}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.confirmModalButton, ...styles.confirmSaveBtn }}
                onClick={confirmCancelPasswordReset}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

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

      <form onSubmit={handleSubmit} noValidate style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>Forgot Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we will send you a verification code.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          Email Address <span style={styles.requiredMark}>*</span>
        </label>
        <input
          ref={emailRef}
          type="email"
          name="email"
          placeholder="Email address"
          style={{
            ...styles.input,
            ...(visibleEmailError ? styles.inputError : {}),
          }}
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onKeyDown={handleRequiredKeyDown}
          onBlur={handleEmailBlur}
          autoComplete="email"
          aria-invalid={Boolean(visibleEmailError)}
          aria-describedby={visibleEmailError ? 'forgot-password-email-error' : undefined}
        />
        <p
          id="forgot-password-email-error"
          style={{
            ...styles.fieldError,
            visibility: visibleEmailError ? 'visible' : 'hidden',
          }}
        >
          {visibleEmailError}
        </p>

        <button
          type="submit"
          disabled={checking}
          style={{ ...styles.button, ...(checking ? styles.buttonDisabled : {}) }}
        >
          {checking ? 'Checking...' : 'Send Code'}
        </button>

        <p style={styles.note}>
          Remember your password?{' '}
          <span style={styles.link} onClick={openCancelPasswordPrompt}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
