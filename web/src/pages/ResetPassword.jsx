import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useIconStyles } from '../utils/iconStyles';
import createResetPasswordStyles from '../styles/ResetPassword';
import clinicLogo from '../assets/clinicLogo/clinic-logo-auth.png';

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
  const [touched, setTouched] = useState({ newPassword: false, confirmPassword: false });
  const [fieldErrors, setFieldErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmResetPrompt, setShowConfirmResetPrompt] = useState(false);
  const [showCancelPasswordPrompt, setShowCancelPasswordPrompt] = useState(false);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useIconStyles(showConfirmResetPrompt || showCancelPasswordPrompt);

  const visibleNewPasswordError = (touched.newPassword || submittedOnce) ? fieldErrors.newPassword : '';
  const visibleConfirmPasswordError =
    (touched.confirmPassword || submittedOnce) ? fieldErrors.confirmPassword : '';
  const newPasswordInputStyle = {
    ...styles.input,
    ...(visibleNewPasswordError ? styles.inputError : {}),
    paddingRight: 74,
  };
  const confirmPasswordInputStyle = {
    ...styles.input,
    ...(visibleConfirmPasswordError ? styles.inputError : {}),
    paddingRight: 74,
  };
  const toggleBtnStyle = {
    position: 'absolute',
    right: 12,
    top: 0,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    background: 'transparent',
    color: '#8b6508',
    fontWeight: 900,
    cursor: 'pointer',
    padding: '6px 8px',
  };

  function validatePassword(value) {
    const passwordValue = String(value || '');
    if (!passwordValue.trim()) return 'This field is required';
    if (!/^[a-zA-Z0-9]+$/.test(passwordValue)) {
      return 'Password must not contain spaces or special characters.';
    }
    if (passwordValue.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (!/[a-zA-Z]/.test(passwordValue) || !/[0-9]/.test(passwordValue)) {
      return 'Password must contain at least one letter and one number.';
    }
    return '';
  }

  function validateConfirmPassword(value, nextPassword = newPassword) {
    const requiredError = validatePassword(value);
    if (requiredError) return requiredError;
    if (String(value) !== String(nextPassword)) {
      return 'Passwords do not match.';
    }
    return '';
  }

  function validateForm() {
    return {
      newPassword: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword, newPassword),
    };
  }

  function handlePasswordChange(field, value) {
    const nextValue = String(value || '').replace(/\s/g, '');

    if (field === 'newPassword') {
      setNewPassword(nextValue);
    } else {
      setConfirmPassword(nextValue);
    }

    setFieldErrors((current) => {
      const shouldValidateField = touched[field] || submittedOnce || value !== nextValue;
      const nextErrors = { ...current };

      if (field === 'newPassword') {
        if (shouldValidateField) {
          nextErrors.newPassword = validatePassword(nextValue);
        }
        if (touched.confirmPassword || submittedOnce) {
          nextErrors.confirmPassword = validateConfirmPassword(confirmPassword, nextValue);
        }
      } else if (shouldValidateField) {
        nextErrors.confirmPassword = validateConfirmPassword(nextValue, newPassword);
      }

      return nextErrors;
    });

    if (value !== nextValue) {
      setTouched((current) => ({ ...current, [field]: true }));
    }
  }

  function handlePasswordBlur(field) {
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => ({
      ...current,
      [field]: field === 'newPassword'
        ? validatePassword(newPassword)
        : validateConfirmPassword(confirmPassword, newPassword),
    }));
  }

  function handlePasswordKeyDown(field, event) {
    const value = event.currentTarget.value || '';
    const selectionStart = event.currentTarget.selectionStart ?? value.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;

    if (event.key === ' ') {
      event.preventDefault();
      setTouched((current) => ({ ...current, [field]: true }));
      setFieldErrors((current) => ({
        ...current,
        [field]: 'Password must not contain spaces or special characters.',
      }));
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const nextValue =
        event.key === 'Backspace'
          ? value.slice(0, selectionStart === selectionEnd ? Math.max(0, selectionStart - 1) : selectionStart) + value.slice(selectionEnd)
          : value.slice(0, selectionStart) + value.slice(selectionStart === selectionEnd ? selectionEnd + 1 : selectionEnd);

      if (!nextValue.trim()) {
        setTouched((current) => ({ ...current, [field]: true }));
        setFieldErrors((current) => ({ ...current, [field]: 'This field is required' }));
      }
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmittedOnce(true);

    const nextErrors = validateForm();
    setTouched({ newPassword: true, confirmPassword: true });
    setFieldErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      if (nextErrors.newPassword) {
        newPasswordRef.current?.focus();
      } else {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    setShowConfirmResetPrompt(true);
  }

  function closeConfirmResetPrompt() {
    setShowConfirmResetPrompt(false);
  }

  async function confirmResetPassword() {
    setShowConfirmResetPrompt(false);
    setError('');
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successful! You may now sign in.' },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      if (msg === 'Invalid code' || msg === 'No valid OTP found' || msg === 'OTP is invalid') {
        setError('Your verification code is invalid or expired. Please start over.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
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

  if (!email || !code) return null;

  return (
    <main style={styles.page}>
      <form onSubmit={handleSubmit} noValidate style={styles.card}>
        <img
          src={clinicLogo}
          alt="Clinic Logo"
          width="200"
          height="150"
          fetchPriority="high"
          decoding="async"
          style={styles.logo}
        />
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below to update your account.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>
          New Password <span style={styles.requiredMark}>*</span>
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={newPasswordRef}
            type={showNewPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            style={newPasswordInputStyle}
            value={newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            onKeyDown={(e) => handlePasswordKeyDown('newPassword', e)}
            onBlur={() => handlePasswordBlur('newPassword')}
            autoComplete="new-password"
            aria-invalid={Boolean(visibleNewPasswordError)}
            aria-describedby={visibleNewPasswordError ? 'reset-password-new-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            style={toggleBtnStyle}
            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
          >
            {showNewPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <p
          id="reset-password-new-error"
          style={{
            ...styles.fieldError,
            visibility: visibleNewPasswordError ? 'visible' : 'hidden',
          }}
        >
          {visibleNewPasswordError}
        </p>

        <label style={styles.label}>
          Confirm Password <span style={styles.requiredMark}>*</span>
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={confirmPasswordRef}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            style={confirmPasswordInputStyle}
            value={confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            onKeyDown={(e) => handlePasswordKeyDown('confirmPassword', e)}
            onBlur={() => handlePasswordBlur('confirmPassword')}
            autoComplete="new-password"
            aria-invalid={Boolean(visibleConfirmPasswordError)}
            aria-describedby={visibleConfirmPasswordError ? 'reset-password-confirm-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            style={toggleBtnStyle}
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <p
          id="reset-password-confirm-error"
          style={{
            ...styles.fieldError,
            visibility: visibleConfirmPasswordError ? 'visible' : 'hidden',
          }}
        >
          {visibleConfirmPasswordError}
        </p>

        <button
          type="submit"
          disabled={submitting}
          style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>

        <p style={styles.note}>
          Remember your password?{' '}
          <span style={styles.link} onClick={openCancelPasswordPrompt}>
            Login
          </span>
        </p>
      </form>

      {showConfirmResetPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeConfirmResetPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-key" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Change Password</h2>
            <p style={styles.modalText}>
              Are you sure you want to change your password?
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.cancelBtn }}
                disabled={submitting}
                onClick={closeConfirmResetPrompt}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.saveBtn }}
                disabled={submitting}
                onClick={confirmResetPassword}
              >
                {submitting ? 'Resetting...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelPasswordPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeCancelPasswordPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Cancel Password Reset</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel password reset and go back to login?
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.cancelBtn }}
                onClick={closeCancelPasswordPrompt}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.modalActionButton, ...styles.saveBtn }}
                onClick={confirmCancelPasswordReset}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
