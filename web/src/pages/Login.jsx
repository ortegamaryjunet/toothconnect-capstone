import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useIconStyles } from '../utils/iconStyles';
import { roleHomePath } from '../utils/routes';
import createLoginStyles from '../styles/Login.js';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

const styles = createLoginStyles({ isMobile: window.innerWidth < 520 });
const LOGIN_LOCKOUT_STORAGE_KEY = 'loginLockout';

function sanitizeLoginEmail(value) {
  return String(value || '').replace(/[^a-zA-Z0-9@.-]/g, '');
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = sanitizeLoginEmail(location.state?.email).trim();
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showForgotPasswordPrompt, setShowForgotPasswordPrompt] = useState(false);
  const [forgotPasswordCooldownUntil, setForgotPasswordCooldownUntil] = useState(null);
  const [forgotPasswordCooldownRemaining, setForgotPasswordCooldownRemaining] = useState(0);
  const [adminRegisterCooldownUntil, setAdminRegisterCooldownUntil] = useState(null);
  const [adminRegisterCooldownRemaining, setAdminRegisterCooldownRemaining] = useState(0);
  const [loginLockoutUntil, setLoginLockoutUntil] = useState(null);
  const [loginLockoutRemaining, setLoginLockoutRemaining] = useState(0);
  const [loginLockoutEmail, setLoginLockoutEmail] = useState('');
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const stateMessage = location.state?.message ?? '';
  const stateMessageType = location.state?.messageType ?? 'success';
  const [banner, setBanner] = useState(stateMessage);
  const [bannerType, setBannerType] = useState(stateMessageType);

  useIconStyles(showRegisterPrompt || showForgotPasswordPrompt);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(LOGIN_LOCKOUT_STORAGE_KEY) || 'null');
      const storedUntil = Number(stored?.until || 0);
      const storedEmail = String(stored?.email || '').trim().toLowerCase();
      if (storedUntil > Date.now()) {
        setLoginLockoutUntil(storedUntil);
        setLoginLockoutEmail(storedEmail);
        if (storedEmail && !prefillEmail) {
          setEmail(storedEmail);
        }
        setError(stored?.message || 'Too many login attempts, please try again after 15 mins.');
      } else {
        window.localStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(''), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    const stateCooldownUntil = Number(location.state?.forgotPasswordCooldownUntil || 0);
    const stateCooldownEmail = String(location.state?.forgotPasswordCooldownEmail || '').trim();

    if (stateCooldownUntil && stateCooldownUntil > Date.now()) {
      setForgotPasswordCooldownUntil(stateCooldownUntil);
      try {
        window.localStorage.setItem('forgotPasswordCooldown', JSON.stringify({
          email: stateCooldownEmail || prefillEmail,
          until: stateCooldownUntil,
        }));
      } catch {
        // Ignore storage errors; backend still enforces cooldown.
      }
      return;
    }

    try {
      const stored = JSON.parse(window.localStorage.getItem('forgotPasswordCooldown') || 'null');
      const storedUntil = Number(stored?.until || 0);
      if (storedUntil > Date.now()) {
        setForgotPasswordCooldownUntil(storedUntil);
      } else {
        window.localStorage.removeItem('forgotPasswordCooldown');
      }
    } catch {
      window.localStorage.removeItem('forgotPasswordCooldown');
    }
  }, [location.state, prefillEmail]);

  useEffect(() => {
    const stateCooldownUntil = Number(location.state?.adminRegisterCooldownUntil || 0);
    const stateCooldownEmail = String(location.state?.adminRegisterCooldownEmail || '').trim();

    if (stateCooldownUntil && stateCooldownUntil > Date.now()) {
      setAdminRegisterCooldownUntil(stateCooldownUntil);
      try {
        window.localStorage.setItem('adminRegisterCooldown', JSON.stringify({
          email: stateCooldownEmail || prefillEmail,
          until: stateCooldownUntil,
        }));
      } catch {
        // Ignore storage errors; backend still enforces cooldown.
      }
      return;
    }

    try {
      const stored = JSON.parse(window.localStorage.getItem('adminRegisterCooldown') || 'null');
      const storedUntil = Number(stored?.until || 0);
      if (storedUntil > Date.now()) {
        setAdminRegisterCooldownUntil(storedUntil);
      } else {
        window.localStorage.removeItem('adminRegisterCooldown');
      }
    } catch {
      window.localStorage.removeItem('adminRegisterCooldown');
    }
  }, [location.state, prefillEmail]);

  useEffect(() => {
    if (!forgotPasswordCooldownUntil) {
      setForgotPasswordCooldownRemaining(0);
      return undefined;
    }

    function syncCooldown() {
      const remaining = Math.max(0, Math.ceil((forgotPasswordCooldownUntil - Date.now()) / 1000));
      setForgotPasswordCooldownRemaining(remaining);
      if (remaining <= 0) {
        setForgotPasswordCooldownUntil(null);
        try {
          window.localStorage.removeItem('forgotPasswordCooldown');
        } catch {
          // Ignore storage errors.
        }
      }
    }

    syncCooldown();
    const interval = setInterval(syncCooldown, 1000);
    return () => clearInterval(interval);
  }, [forgotPasswordCooldownUntil]);

  useEffect(() => {
    if (!adminRegisterCooldownUntil) {
      setAdminRegisterCooldownRemaining(0);
      return undefined;
    }

    function syncCooldown() {
      const remaining = Math.max(0, Math.ceil((adminRegisterCooldownUntil - Date.now()) / 1000));
      setAdminRegisterCooldownRemaining(remaining);
      if (remaining <= 0) {
        setAdminRegisterCooldownUntil(null);
        try {
          window.localStorage.removeItem('adminRegisterCooldown');
        } catch {
          // Ignore storage errors.
        }
      }
    }

    syncCooldown();
    const interval = setInterval(syncCooldown, 1000);
    return () => clearInterval(interval);
  }, [adminRegisterCooldownUntil]);

  useEffect(() => {
    if (!loginLockoutUntil) {
      setLoginLockoutRemaining(0);
      return undefined;
    }

    function syncLockout() {
      const remaining = Math.max(0, Math.ceil((loginLockoutUntil - Date.now()) / 1000));
      setLoginLockoutRemaining(remaining);
      if (remaining <= 0) {
        setLoginLockoutUntil(null);
        setLoginLockoutEmail('');
        setError('');
        try {
          window.localStorage.removeItem(LOGIN_LOCKOUT_STORAGE_KEY);
        } catch {
          // Ignore storage errors; backend still enforces lockout.
        }
      }
    }

    syncLockout();
    const interval = setInterval(syncLockout, 1000);
    return () => clearInterval(interval);
  }, [loginLockoutUntil]);

  const visibleEmailError = (touched.email || submittedOnce) ? fieldErrors.email : '';
  const visiblePasswordError = (touched.password || submittedOnce) ? fieldErrors.password : '';
  const isCurrentEmailLocked =
    Boolean(loginLockoutUntil) &&
    loginLockoutUntil > Date.now() &&
    loginLockoutEmail === String(email || '').trim().toLowerCase();
  const loginLockoutDisplayRemaining = isCurrentEmailLocked
    ? Math.max(loginLockoutRemaining, Math.ceil((loginLockoutUntil - Date.now()) / 1000))
    : 0;
  const passwordInputStyle = {
    ...styles.input,
    ...(visiblePasswordError ? styles.inputError : {}),
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

  function validateEmail(value) {
    const trimmedEmail = String(value || '').trim();
    if (!trimmedEmail) return 'This field is required';
    if (/[^a-zA-Z0-9@.-]/.test(trimmedEmail)) {
      return 'Special characters are not allowed except . and -';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return 'Enter a valid email address';
    }
    return '';
  }

  function validatePassword(value) {
    if (!String(value || '').trim()) return 'This field is required';
    return '';
  }

  function validateField(name, value) {
    return name === 'email' ? validateEmail(value) : validatePassword(value);
  }

  function validateForm() {
    return {
      email: validateEmail(email),
      password: validatePassword(password),
    };
  }

  function handleFieldChange(name, value) {
    const previousValue = name === 'email' ? email : password;
    const nextValue = name === 'email' ? sanitizeLoginEmail(value) : value;

    if (name === 'email') {
      setEmail(nextValue);
    } else {
      setPassword(nextValue);
    }

    const shouldShowRequiredError =
      !String(nextValue || '').trim() &&
      (String(nextValue || '').length > 0 || String(previousValue || '').length > 0);

    if (shouldShowRequiredError) {
      setTouched((current) => ({ ...current, [name]: true }));
    }

    if (touched[name] || submittedOnce || shouldShowRequiredError) {
      setFieldErrors((current) => ({
        ...current,
        [name]: validateField(name, nextValue),
      }));
    }
  }

  function handleFieldBlur(name) {
    setTouched((current) => ({ ...current, [name]: true }));
    setFieldErrors((current) => ({
      ...current,
      [name]: validateField(name, name === 'email' ? email : password),
    }));
  }

  function showRequiredError(name) {
    setTouched((current) => ({ ...current, [name]: true }));
    setFieldErrors((current) => ({
      ...current,
      [name]: 'This field is required',
    }));
  }

  function handleRequiredKeyDown(name, event) {
    const value = event.currentTarget.value || '';
    const selectionStart = event.currentTarget.selectionStart ?? value.length;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;

    if (event.key === ' ' && !value.trim()) {
      showRequiredError(name);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const nextValue =
        event.key === 'Backspace'
          ? value.slice(0, selectionStart === selectionEnd ? Math.max(0, selectionStart - 1) : selectionStart) + value.slice(selectionEnd)
          : value.slice(0, selectionStart) + value.slice(selectionStart === selectionEnd ? selectionEnd + 1 : selectionEnd);

      if (!nextValue.trim()) {
        showRequiredError(name);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isCurrentEmailLocked) return;
    setError('');
    setSubmittedOnce(true);

    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (nextErrors.email || nextErrors.password) {
      if (nextErrors.email) {
        emailRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      navigate(roleHomePath(user.role), { replace: true });
    } catch (err) {
      const responseMessage = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.locked) {
        const lockoutUntil = err.response?.data?.lockout_until
          ? new Date(err.response.data.lockout_until).getTime()
          : Date.now() + 15 * 60 * 1000;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if (Number.isFinite(lockoutUntil) && lockoutUntil > Date.now()) {
          setLoginLockoutUntil(lockoutUntil);
          setLoginLockoutEmail(normalizedEmail);
          try {
            window.localStorage.setItem(LOGIN_LOCKOUT_STORAGE_KEY, JSON.stringify({
              email: normalizedEmail,
              until: lockoutUntil,
              message: responseMessage,
            }));
          } catch {
            // Ignore storage errors; backend still enforces lockout.
          }
        }
      }
      setError(responseMessage);
    } finally {
      setSubmitting(false);
    }
  }

  function openRegisterPrompt() {
    if (adminRegisterCooldownRemaining > 0) return;
    setShowRegisterPrompt(true);
  }

  function closeRegisterPrompt() {
    setShowRegisterPrompt(false);
  }

  function confirmRegisterPrompt() {
    setShowRegisterPrompt(false);
    navigate('/register');
  }

  function openForgotPasswordPrompt() {
    if (forgotPasswordCooldownRemaining > 0) return;
    setShowForgotPasswordPrompt(true);
  }

  function closeForgotPasswordPrompt() {
    setShowForgotPasswordPrompt(false);
  }

  function confirmForgotPasswordPrompt() {
    setShowForgotPasswordPrompt(false);
    navigate('/forgotpassword');
  }

  function formatCooldown(seconds) {
    const safeSeconds = Math.max(0, Number(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} noValidate style={styles.card}>
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
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onKeyDown={(e) => handleRequiredKeyDown('email', e)}
          onBlur={() => handleFieldBlur('email')}
          style={{
            ...styles.input,
            ...(visibleEmailError ? styles.inputError : {}),
          }}
          autoComplete="email"
          aria-invalid={Boolean(visibleEmailError)}
          aria-describedby={visibleEmailError ? 'login-email-error' : undefined}
        />
        <p
          id="login-email-error"
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
            value={password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            onKeyDown={(e) => handleRequiredKeyDown('password', e)}
            onBlur={() => handleFieldBlur('password')}
            style={passwordInputStyle}
            autoComplete="current-password"
            aria-invalid={Boolean(visiblePasswordError)}
            aria-describedby={visiblePasswordError ? 'login-password-error' : undefined}
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
          id="login-password-error"
          style={{
            ...styles.fieldError,
            visibility: visiblePasswordError ? 'visible' : 'hidden',
          }}
        >
            {visiblePasswordError}
        </p>

        <p style={styles.forgotPasswordRow}>
          <span
            style={{
              ...styles.link,
              ...(forgotPasswordCooldownRemaining > 0 ? styles.disabledLink : {}),
            }}
            onClick={openForgotPasswordPrompt}
          >
            Forgot Password?
          </span>
          {forgotPasswordCooldownRemaining > 0 && (
            <span style={styles.cooldownText}>
              Try again in {formatCooldown(forgotPasswordCooldownRemaining)}
            </span>
          )}
        </p>

        <button
          type="submit"
          disabled={submitting || isCurrentEmailLocked}
          style={{ ...styles.button, ...((submitting || isCurrentEmailLocked) ? styles.buttonDisabled : {}) }}
        >
          {submitting
            ? 'Signing in...'
            : isCurrentEmailLocked
              ? `Try again in ${formatCooldown(loginLockoutDisplayRemaining)}`
              : 'Sign in'}
        </button>

        <p style={styles.note}>
          <span>
            No account yet?{' '}
            <span
              style={{
                ...styles.link,
                ...(adminRegisterCooldownRemaining > 0 ? styles.disabledLink : {}),
              }}
              onClick={openRegisterPrompt}
            >
              Register
            </span>
          </span>
          {adminRegisterCooldownRemaining > 0 && (
            <span style={styles.cooldownText}>
              Try again in {formatCooldown(adminRegisterCooldownRemaining)}
            </span>
          )}
        </p>
      </form>

      {showRegisterPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeRegisterPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-user-add" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Register Admin Account</h2>
            <p style={styles.modalText}>
              This registration is for an admin account. You can only register 1 admin account.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeRegisterPrompt}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={confirmRegisterPrompt}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showForgotPasswordPrompt && (
        <div style={styles.modal} onClick={(e) => { if (e.target === e.currentTarget) closeForgotPasswordPrompt(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalIcon}>
              <i className="fi fi-rr-key" style={styles.modalIconText}></i>
            </div>
            <h2 style={styles.modalTitle}>Forgot Password</h2>
            <p style={styles.modalText}>
              Can't remember your password? Create a new one.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.cancelBtn }}
                onClick={closeForgotPasswordPrompt}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{ ...styles.modalButton, ...styles.saveBtn }}
                onClick={confirmForgotPasswordPrompt}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

