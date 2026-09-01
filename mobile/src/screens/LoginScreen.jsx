import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { formatErrorText } from '../utils/errors';
import styles from '../styles/LoginScreen';

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const otpLocked = !!(route?.params?.registerOtpLocked || route?.params?.passwordResetOtpLocked);
  const routeCooldownUntil = Number(
    route?.params?.registerCooldownUntil || route?.params?.passwordResetCooldownUntil || 0
  );
  const routeCooldownSeconds = Number(
    route?.params?.registerCooldownSeconds || route?.params?.passwordResetCooldownSeconds || 0
  );
  const [email, setEmail] = useState(otpLocked ? '' : route?.params?.prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [loginLockoutUntil, setLoginLockoutUntil] = useState(0);
  const [loginLockoutSeconds, setLoginLockoutSeconds] = useState(0);
  const [registerCooldownUntil, setRegisterCooldownUntil] = useState(
    routeCooldownUntil
  );
  const [registerCooldownSeconds, setRegisterCooldownSeconds] = useState(
    Math.max(
      0,
      Math.ceil((routeCooldownUntil - Date.now()) / 1000) || routeCooldownSeconds
    )
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showMessage, setShowMessage] = useState(
    !!route?.params?.prefilledEmail || otpLocked
  );
  const hasActiveOtpCooldown = registerCooldownSeconds > 0;
  const registerCreateDisabled = !!route?.params?.registerOtpLocked && hasActiveOtpCooldown;
  const forgotPasswordDisabled = !!route?.params?.passwordResetOtpLocked && hasActiveOtpCooldown;
  const loginLocked = loginLockoutSeconds > 0;
  const registerCooldownMessage =
    route?.params?.passwordResetCooldownMessage ||
    route?.params?.registerCooldownMessage ||
    'Too many failed attempts. Please wait 5 minutes before creating an account.';

  useEffect(() => {
    if (route?.params?.prefilledEmail && !otpLocked) {
      setEmail(route.params.prefilledEmail);
      setShowMessage(true);
    }
  }, [route?.params?.prefilledEmail, otpLocked]);

  useEffect(() => {
    if (otpLocked) {
      const nextCooldownUntil = routeCooldownUntil ||
        Date.now() + Number(routeCooldownSeconds || 5 * 60) * 1000;

      setEmail('');
      setRegisterCooldownUntil(nextCooldownUntil);
      setRegisterCooldownSeconds(
        Math.max(0, Math.ceil((nextCooldownUntil - Date.now()) / 1000))
      );
      setShowMessage(true);
    }
  }, [
    otpLocked,
    routeCooldownSeconds,
    routeCooldownUntil,
  ]);

  useEffect(() => {
    if (showMessage && !hasActiveOtpCooldown) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [hasActiveOtpCooldown, showMessage]);

  useEffect(() => {
    if (!hasActiveOtpCooldown) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (registerCooldownUntil > 0) {
        setRegisterCooldownSeconds(
          Math.max(0, Math.ceil((registerCooldownUntil - Date.now()) / 1000))
        );
        return;
      }

      setRegisterCooldownSeconds(current => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [registerCooldownUntil, hasActiveOtpCooldown, registerCooldownSeconds]);

  useEffect(() => {
    if (!loginLocked) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (loginLockoutUntil > 0) {
        setLoginLockoutSeconds(
          Math.max(0, Math.ceil((loginLockoutUntil - Date.now()) / 1000))
        );
        return;
      }

      setLoginLockoutSeconds(current => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [loginLockoutUntil, loginLocked, loginLockoutSeconds]);

  function formatCooldown(seconds) {
    const safeSeconds = Math.max(0, Number(seconds || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  function getLoginErrorMessage(message) {
    if (message === 'Email and password are required') {
      return 'Email and Password are Required.';
    }

    if (message === 'Account is inactive') {
      return 'Account is Inactive.';
    }

    if (message === 'Incorrect email or password.') {
      return 'Incorrect Email or Password.';
    }

    return formatErrorText(message || 'Incorrect Email or Password.');
  }

  function startLoginLockout(responseData) {
    const lockoutUntil = responseData.lockout_until
      ? new Date(responseData.lockout_until).getTime()
      : 0;
    const retryAfterSeconds = Number(responseData.retry_after_seconds || 0);
    const fallbackSeconds = lockoutUntil > 0
      ? (lockoutUntil - Date.now()) / 1000
      : 5 * 60;
    const lockoutSeconds = Math.max(
      0,
      Math.ceil(retryAfterSeconds > 0 ? retryAfterSeconds : fallbackSeconds)
    );

    setLoginLockoutUntil(lockoutUntil || Date.now() + lockoutSeconds * 1000);
    setLoginLockoutSeconds(lockoutSeconds);
  }

  async function handleSubmit() {
    if (loginLocked) {
      return;
    }

    setError('');
    setFieldErrors({ email: false, password: false });

    const trimmedEmail = email.trim();
    const nextFieldErrors = {
      email: !trimmedEmail,
      password: !password,
    };

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      setError('Email and Password are Required.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFieldErrors({ email: true, password: false });
      setError('The Email Address Format is Incorrect.');
      return;
    }

    setSubmitting(true);
    try {
      await login(trimmedEmail.toLowerCase(), password);
    } catch (err) {
      const responseData = err.response?.data || {};
      const message = getLoginErrorMessage(responseData.message || responseData.error);
      setError(message);
      if (responseData.locked || err.response?.status === 423) {
        startLoginLockout(responseData);
      }
      setFieldErrors({
        email: message === 'Incorrect Email or Password.' || message === 'Email and Password are Required.',
        password: message === 'Incorrect Email or Password.' || message === 'Email and Password are Required.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/clinic-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>ToothConnect</Text>
            <Text style={styles.subtitle}>Your dental care, connected.</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>LOGIN</Text>

            {showMessage && (
              route?.params?.prefilledEmail ||
              otpLocked ||
              hasActiveOtpCooldown
            ) ? (
              <View
                style={[
                  styles.successBox,
                  (route?.params?.otpFailed || otpLocked || hasActiveOtpCooldown) &&
                    styles.warningBox,
                ]}
              >
                <Text
                  style={[
                    styles.successText,
                    (route?.params?.otpFailed || otpLocked || hasActiveOtpCooldown) &&
                      styles.warningText,
                  ]}
                >
                  {otpLocked || hasActiveOtpCooldown
                    ? `${formatErrorText(registerCooldownMessage)} ${formatCooldown(registerCooldownSeconds)}`
                    : route?.params?.otpFailed
                    ? 'OTP verification unsuccessful. Please wait for a few minutes and try again.'
                    : route?.params?.resetSuccess
                      ? 'Password has been reset. Please log in with your new password.'
                      : 'Registration complete. Please log in with your registered account.'}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.label, fieldErrors.email && styles.labelError]}>
              Email{fieldErrors.email ? ' *' : ''}
            </Text>
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) {
                  setError('');
                }
                if (fieldErrors.email) {
                  setFieldErrors(current => ({ ...current, email: false }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholderTextColor="#b8b8b8"
            />

            <Text style={[styles.label, fieldErrors.password && styles.labelError]}>
              Password{fieldErrors.password ? ' *' : ''}
            </Text>
            <View style={[styles.passwordWrapper, fieldErrors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  if (error) {
                    setError('');
                  }
                  if (fieldErrors.password) {
                    setFieldErrors(current => ({ ...current, password: false }));
                  }
                }}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                placeholderTextColor="#b8b8b8"
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={submitting}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() =>
                navigation.navigate('ForgotPassword', {
                  prefilledEmail: email.trim().toLowerCase(),
                  returnToLoginParams: registerCreateDisabled
                    ? {
                        registerOtpLocked: true,
                        registerCooldownSeconds,
                        registerCooldownUntil,
                        registerCooldownMessage,
                      }
                    : undefined,
                })
              }
              disabled={submitting || forgotPasswordDisabled}
            >
              <Text style={[styles.forgotText, forgotPasswordDisabled && styles.linkDisabled]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, (submitting || loginLocked) && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting || loginLocked}
            >
              <Text style={styles.buttonText}>
                {submitting
                  ? 'SIGNING IN...'
                  : loginLocked
                    ? formatCooldown(loginLockoutSeconds)
                    : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.link}
              disabled={submitting || registerCreateDisabled}
            >
              <Text style={styles.linkText}>
                Don’t have an account?{' '}
                <Text
                  style={[
                    styles.linkHighlight,
                    registerCreateDisabled && styles.linkDisabled,
                  ]}
                >
                  Create Account
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
