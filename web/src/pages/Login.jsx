import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import createLoginStyles from '../styles/Login.js';
import clinicLogo from '../assets/clinicLogo/clinic-logo.png';

const styles = createLoginStyles({ isMobile: window.innerWidth < 520 });

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const prefillEmail = String(location.state?.email ?? '').trim();
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const stateMessage = location.state?.message ?? '';
  const stateMessageType = location.state?.messageType ?? 'success';
  const [banner, setBanner] = useState(stateMessage);
  const [bannerType, setBannerType] = useState(stateMessageType);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(''), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  const visibleEmailError = (touched.email || submittedOnce) ? fieldErrors.email : '';
  const visiblePasswordError = (touched.password || submittedOnce) ? fieldErrors.password : '';
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

    if (name === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    const shouldShowRequiredError =
      !String(value || '').trim() &&
      (String(value || '').length > 0 || String(previousValue || '').length > 0);

    if (shouldShowRequiredError) {
      setTouched((current) => ({ ...current, [name]: true }));
    }

    if (touched[name] || submittedOnce || shouldShowRequiredError) {
      setFieldErrors((current) => ({
        ...current,
        [name]: validateField(name, value),
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

  async function handleSubmit(e) {
    e.preventDefault();
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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
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

        <p style={{ margin: '0 0 18px', textAlign: 'right' }}>
          <span style={styles.link} onClick={() => navigate('/forgotpassword')}>
            Forgot Password?
          </span>
        </p>

        <button
          type="submit"
          disabled={submitting}
          style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={styles.note}>
          No account yet?{' '}
          <span style={styles.link} onClick={() => navigate('/register')}>
            Register
          </span>
        </p>
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
