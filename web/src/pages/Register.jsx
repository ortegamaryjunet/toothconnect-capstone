import { useRef, useState } from 'react';
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
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCreateAdminPrompt, setShowCreateAdminPrompt] = useState(false);
  const [showCancelRegistrationPrompt, setShowCancelRegistrationPrompt] = useState(false);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const visibleNameError = (touched.name || submittedOnce) ? fieldErrors.name : '';
  const visibleEmailError = (touched.email || submittedOnce) ? fieldErrors.email : '';
  const visiblePasswordError = (touched.password || submittedOnce) ? fieldErrors.password : '';
  const visibleConfirmPasswordError =
    (touched.confirmPassword || submittedOnce) ? fieldErrors.confirmPassword : '';
  const passwordInputStyle = {
    ...styles.input,
    ...(visiblePasswordError ? styles.inputError : {}),
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

  function validateRequired(value) {
    return String(value || '').trim() ? '' : 'This field is required';
  }

  function validateEmail(value) {
    const requiredError = validateRequired(value);
    if (requiredError) return requiredError;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())) {
      return 'Enter a valid email address';
    }
    return '';
  }

  function validatePassword(value) {
    const passwordValue = String(value || '');
    const requiredError = validateRequired(passwordValue);
    if (requiredError) return requiredError;
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

  function validateConfirmPassword(value, nextPassword = password) {
    const requiredError = validateRequired(value);
    if (requiredError) return requiredError;
    const passwordError = validatePassword(value);
    if (passwordError) return passwordError;
    if (String(value) !== String(nextPassword)) {
      return 'Passwords do not match.';
    }
    return '';
  }

  function validateField(field, value, nextValues = {}) {
    const nextPassword = nextValues.password ?? password;

    if (field === 'name') return validateRequired(value);
    if (field === 'email') return validateEmail(value);
    if (field === 'password') return validatePassword(value);
    if (field === 'confirmPassword') return validateConfirmPassword(value, nextPassword);
    return '';
  }

  function validateForm() {
    return {
      name: validateRequired(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
  }

  function currentFieldValue(field) {
    if (field === 'name') return name;
    if (field === 'email') return email;
    if (field === 'password') return password;
    return confirmPassword;
  }

  function setFieldValue(field, value) {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
  }

  function handleFieldChange(field, value) {
    const previousValue = currentFieldValue(field);
    setFieldValue(field, value);

    const shouldShowRequiredError =
      !String(value || '').trim() &&
      (String(value || '').length > 0 || String(previousValue || '').length > 0);

    if (shouldShowRequiredError) {
      setTouched((current) => ({ ...current, [field]: true }));
    }

    setFieldErrors((current) => {
      const shouldValidateField = touched[field] || submittedOnce || shouldShowRequiredError;
      const nextErrors = { ...current };
      const nextValues = field === 'password' ? { password: value } : {};

      if (shouldValidateField) {
        nextErrors[field] = validateField(field, value, nextValues);
      }

      if (field === 'password' && (touched.confirmPassword || submittedOnce)) {
        nextErrors.confirmPassword = validateConfirmPassword(confirmPassword, value);
      }

      return nextErrors;
    });
  }

  function handleFieldBlur(field) {
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, currentFieldValue(field)),
    }));
  }

  function showRequiredError(field) {
    setTouched((current) => ({ ...current, [field]: true }));
    setFieldErrors((current) => ({
      ...current,
      [field]: 'This field is required',
    }));
  }

  function handleRequiredKeyDown(field, event) {
    const value = event.currentTarget.value || '';
    const selectionStart = event.currentTarget.selectionStart ?? value.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;

    if (event.key === ' ' && !value.trim()) {
      showRequiredError(field);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const nextValue =
        event.key === 'Backspace'
          ? value.slice(0, selectionStart === selectionEnd ? Math.max(0, selectionStart - 1) : selectionStart) + value.slice(selectionEnd)
          : value.slice(0, selectionStart) + value.slice(selectionStart === selectionEnd ? selectionEnd + 1 : selectionEnd);

      if (!nextValue.trim()) {
        showRequiredError(field);
      }
    }
  }

  function focusFirstInvalidField(nextErrors) {
    if (nextErrors.name) {
      nameRef.current?.focus();
    } else if (nextErrors.email) {
      emailRef.current?.focus();
    } else if (nextErrors.password) {
      passwordRef.current?.focus();
    } else if (nextErrors.confirmPassword) {
      confirmPasswordRef.current?.focus();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmittedOnce(true);

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(nextErrors).some(Boolean)) {
      focusFirstInvalidField(nextErrors);
      return;
    }

    setShowCreateAdminPrompt(true);
  }

  function closeCreateAdminPrompt() {
    setShowCreateAdminPrompt(false);
  }

  async function confirmCreateAdminAccount() {
    setShowCreateAdminPrompt(false);
    setSubmitting(true);
    try {
      await api.post('/auth/admin-register/start', { name: name.trim(), email: email.trim(), password });
      navigate('/otp', {
        state: { email: email.trim(), name: name.trim(), password, purpose: 'admin-register' },
      });
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.retry_after_seconds) {
        const cooldownUntil = Date.now() + Number(err.response.data.retry_after_seconds || 0) * 1000;
        try {
          window.localStorage.setItem('adminRegisterCooldown', JSON.stringify({
            email: email.trim(),
            until: cooldownUntil,
          }));
        } catch {
          // Ignore storage errors; backend still enforces cooldown.
        }
        navigate('/login', {
          replace: true,
          state: {
            message: err.response.data.message || 'Too many failed attempts. Please wait 10 minutes before trying to register an admin account again.',
            messageType: 'error',
            email: email.trim(),
            adminRegisterCooldownEmail: email.trim(),
            adminRegisterCooldownUntil: cooldownUntil,
          },
        });
        return;
      }
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function openCancelRegistrationPrompt() {
    setShowCancelRegistrationPrompt(true);
  }

  function closeCancelRegistrationPrompt() {
    setShowCancelRegistrationPrompt(false);
  }

  function confirmCancelRegistration() {
    setShowCancelRegistrationPrompt(false);
    navigate('/login');
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} noValidate style={styles.card}>
        <img src={clinicLogo} alt="Clinic Logo" style={styles.logo} />
        <h1 style={styles.title}>Admin Registration</h1>
        <p style={styles.subtitle}>
          Create an admin account for Smile Empress Dental Hub.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Full Name</label>
        <input
          ref={nameRef}
          type="text"
          placeholder="Enter your full name"
          style={{
            ...styles.input,
            ...(visibleNameError ? styles.inputError : {}),
          }}
          value={name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onKeyDown={(e) => handleRequiredKeyDown('name', e)}
          onBlur={() => handleFieldBlur('name')}
          autoComplete="name"
          aria-invalid={Boolean(visibleNameError)}
          aria-describedby={visibleNameError ? 'register-name-error' : undefined}
        />
        <p
          id="register-name-error"
          style={{
            ...styles.fieldError,
            visibility: visibleNameError ? 'visible' : 'hidden',
          }}
        >
          {visibleNameError}
        </p>

        <label style={styles.label}>Email Address</label>
        <input
          ref={emailRef}
          type="email"
          placeholder="Enter your email address"
          style={{
            ...styles.input,
            ...(visibleEmailError ? styles.inputError : {}),
          }}
          value={email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onKeyDown={(e) => handleRequiredKeyDown('email', e)}
          onBlur={() => handleFieldBlur('email')}
          autoComplete="email"
          aria-invalid={Boolean(visibleEmailError)}
          aria-describedby={visibleEmailError ? 'register-email-error' : undefined}
        />
        <p
          id="register-email-error"
          style={{
            ...styles.fieldError,
            visibility: visibleEmailError ? 'visible' : 'hidden',
          }}
        >
          {visibleEmailError}
        </p>

        <label style={styles.label}>Password</label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={passwordRef}
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters, letters and numbers only"
            style={passwordInputStyle}
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            onKeyDown={(e) => handleRequiredKeyDown('password', e)}
            onBlur={() => handleFieldBlur('password')}
            autoComplete="new-password"
            aria-invalid={Boolean(visiblePasswordError)}
            aria-describedby={visiblePasswordError ? 'register-password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={toggleBtnStyle}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <p
          id="register-password-error"
          style={{
            ...styles.fieldError,
            visibility: visiblePasswordError ? 'visible' : 'hidden',
          }}
        >
          {visiblePasswordError}
        </p>

        <label style={styles.label}>Confirm Password</label>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            ref={confirmPasswordRef}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            style={confirmPasswordInputStyle}
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            onKeyDown={(e) => handleRequiredKeyDown('confirmPassword', e)}
            onBlur={() => handleFieldBlur('confirmPassword')}
            autoComplete="new-password"
            aria-invalid={Boolean(visibleConfirmPasswordError)}
            aria-describedby={visibleConfirmPasswordError ? 'register-confirm-password-error' : undefined}
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
          id="register-confirm-password-error"
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
          {submitting ? 'Sending OTP...' : 'Register'}
        </button>

        <p style={styles.note}>
          Already have an account?{' '}
          <span style={styles.link} onClick={openCancelRegistrationPrompt}>
            Login
          </span>
        </p>
      </form>

      {showCreateAdminPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeCreateAdminPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-user-add" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Create Admin Account</h2>
            <p style={styles.modalText}>Please review the details before creating this admin account.</p>
            <div style={styles.modalDetailList}>
              {[
                ['Full Name', name.trim() || 'Not entered'],
                ['Email Address', email.trim() || 'Not entered'],
                ['Account Type', 'Admin'],
                ['Admin Limit', 'Only 1 admin account can be registered'],
              ].map(([label, value]) => (
                <div key={label} style={styles.modalDetailRow}>
                  <span style={styles.modalDetailLabel}>{label}</span>
                  <strong style={styles.modalDetailValue}>{value}</strong>
                </div>
              ))}
            </div>
            {error && (
              <p style={{ ...styles.modalText, color: '#dc2626', marginTop: 14 }}>{error}</p>
            )}
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                disabled={submitting}
                onClick={closeCreateAdminPrompt}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                disabled={submitting}
                onClick={confirmCreateAdminAccount}
              >
                {submitting ? 'Sending OTP...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelRegistrationPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeCancelRegistrationPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Cancel Registration</h2>
            <p style={styles.modalText}>
              Are you sure you want to cancel the admin registration and go back to login?
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeCancelRegistrationPrompt}
              >
                No
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={confirmCancelRegistration}
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
