import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import { formatErrorText } from '../utils/errors';
import styles from '../styles/RegisterScreen';

const RESEND_WAIT_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;
const MAX_OTP_VERIFICATION_ATTEMPTS = 3;
const PASSWORD_MIN_LENGTH = 8;
const OTP_LOCK_REDIRECT_SECONDS = 5;

export default function RegisterScreen({ navigation }) {
  const { registerStart, registerVerify } = useAuth();
  const requestInFlightRef = useRef(false);

  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState('');
  const [error, setError] = useState('');
  const [touchedFields, setTouchedFields] = useState({});
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [remainingResendAttempts, setRemainingResendAttempts] = useState(MAX_RESEND_ATTEMPTS);
  const [remainingOtpVerificationAttempts, setRemainingOtpVerificationAttempts] = useState(
    MAX_OTP_VERIFICATION_ATTEMPTS
  );
  const [otpCodeExhausted, setOtpCodeExhausted] = useState(false);
  const [otpRedirectSeconds, setOtpRedirectSeconds] = useState(null);
  const [otpLockoutSeconds, setOtpLockoutSeconds] = useState(0);
  const [otpLockoutMessage, setOtpLockoutMessage] = useState('');
  const [hasActiveOtpFlow, setHasActiveOtpFlow] = useState(false);
  const resendLimitReached = remainingResendAttempts === 0;

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    let interval;

    if (step === 'otp' && !resendLimitReached && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }

    if (step === 'otp' && !resendLimitReached && resendTimer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer, resendLimitReached]);

  useEffect(() => {
    if (otpRedirectSeconds === null) {
      return undefined;
    }

    if (otpRedirectSeconds <= 0) {
      navigation.replace('Login', {
        prefilledEmail: email.trim().toLowerCase(),
        registerOtpLocked: true,
        registerCooldownSeconds: otpLockoutSeconds,
        registerCooldownUntil: Date.now() + Number(otpLockoutSeconds || 5 * 60) * 1000,
        registerCooldownMessage: otpLockoutMessage,
      });
      return undefined;
    }

    const timer = setTimeout(() => {
      setOtpRedirectSeconds(current => Math.max(0, Number(current || 0) - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [email, navigation, otpLockoutMessage, otpLockoutSeconds, otpRedirectSeconds]);

  async function loadBranches() {
    setBranchesLoading(true);
    setBranchesError('');

    try {
      const res = await api.get('/auth/branches');
      const nextBranches = res.data.branches || [];
      setBranches(nextBranches);
      setBranchId(currentId => currentId || nextBranches[0]?.id || null);
    } catch (err) {
      setBranches([]);
      setBranchId(null);
      setBranchesError('Branches could not load. Check that the backend is running.');
    } finally {
      setBranchesLoading(false);
    }
  }

  function isValidFullName(value) {
    const cleanName = value.trim().replace(/\s+/g, ' ');
    const words = cleanName.split(' ');

    if (cleanName.length < 3) {
      return false;
    }

    if (words.length < 2) {
      return false;
    }

    return words.every(word => word.length >= 2);
  }

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  function getPasswordError(value) {
    if (value.length < PASSWORD_MIN_LENGTH) {
      return 'Password must be at least 8 characters.';
    }

    if (!/^[A-Za-z\d]+$/.test(value)) {
      return 'Passowrd must not contain spaces or special characters.';
    }

    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return 'Password must contain at least one letter and one number.';
    }

    return '';
  }

  function shouldShowFieldError(fieldName) {
    return Boolean(touchedFields[fieldName] || hasSubmittedForm);
  }

  function touchField(fieldName) {
    setTouchedFields(current => ({ ...current, [fieldName]: true }));
  }

  function handleInvalidOtpAttempt(attemptsRemaining) {
    const safeAttemptsRemaining = Math.max(0, Number(attemptsRemaining || 0));
    setRemainingOtpVerificationAttempts(safeAttemptsRemaining);

    if (safeAttemptsRemaining > 0) {
      setError(`Invalid code. You have ${safeAttemptsRemaining} OTP verification attempts remaining.`);
      return;
    }

    setCode('');
    setOtpCodeExhausted(true);
    setError('OTP verification failed. Please request a new code.');
  }

  function startOtpLockoutRedirect(responseData, message) {
    setOtpLockoutSeconds(Number(responseData.retry_after_seconds || 5 * 60));
    setOtpLockoutMessage(
      responseData.login_message ||
      'Too many failed attempts. Please wait 5 minutes before creating an account.'
    );
    setOtpRedirectSeconds(OTP_LOCK_REDIRECT_SECONDS);
    setError(formatErrorText(`${message} (${OTP_LOCK_REDIRECT_SECONDS})`));
  }

  function getFormFieldErrors() {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'This field is required.';
    } else if (!isValidFullName(name)) {
      nextErrors.name = 'Please enter your first and last name.';
    }

    if (!email.trim()) {
      nextErrors.email = 'This field is required.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!branchId) {
      nextErrors.branch = 'Please pick your preferred branch.';
    }

    if (!password) {
      nextErrors.password = 'This field is required.';
    } else {
      const passwordError = getPasswordError(password);
      if (passwordError) {
        nextErrors.password = passwordError;
      }
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'This field is required.';
    } else {
      const confirmPasswordError = getPasswordError(confirmPassword);
      if (confirmPasswordError) {
        nextErrors.confirmPassword = confirmPasswordError;
      } else if (password !== confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    return nextErrors;
  }

  function getFirstVisibleFormError(fieldErrors) {
    const errorOrder = ['name', 'email', 'branch', 'password', 'confirmPassword'];
    const fieldName = errorOrder.find(key => {
      if (!fieldErrors[key]) {
        return false;
      }

      return key === 'branch' ? hasSubmittedForm : shouldShowFieldError(key);
    });

    return fieldName ? fieldErrors[fieldName] : '';
  }

  function redirectAfterOtpLimit() {
    Alert.alert(
      'OTP verification unsuccessful',
      'Please wait for a few minutes and try again.',
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.replace('Login', {
              prefilledEmail: email.trim().toLowerCase(),
              otpFailed: true,
            }),
        },
      ]
    );
  }

  function handleBackToForm() {
    setStep('form');
    setError('');
    setCode('');
    setOtpRedirectSeconds(null);
    setOtpLockoutSeconds(0);
    setOtpLockoutMessage('');
  }

  async function handleStart() {
    if (requestInFlightRef.current) {
      return;
    }

    setError('');
    setHasSubmittedForm(true);

    const fieldErrors = getFormFieldErrors();
    const firstError = fieldErrors.name ||
      fieldErrors.email ||
      fieldErrors.branch ||
      fieldErrors.password ||
      fieldErrors.confirmPassword ||
      '';
    if (firstError) {
      setError(firstError);
      return;
    }

    setSubmitting(true);
    requestInFlightRef.current = true;

    try {
      const result = await registerStart(
        email.trim().toLowerCase(),
        name.trim(),
        password,
        branchId,
        hasActiveOtpFlow
      );

      setStep('otp');
      setCode('');
      setHasActiveOtpFlow(true);
      setRemainingOtpVerificationAttempts(MAX_OTP_VERIFICATION_ATTEMPTS);
      setOtpCodeExhausted(false);
      setOtpRedirectSeconds(null);
      setOtpLockoutSeconds(0);
      setOtpLockoutMessage('');
      setHasSubmittedForm(false);
      setRemainingResendAttempts(
        Number(result?.resend_attempts_remaining ?? MAX_RESEND_ATTEMPTS)
      );
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(formatErrorText(err.response?.data?.message || 'Registration failed.'));
    } finally {
      requestInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (requestInFlightRef.current) {
      return;
    }

    setError('');

    if (!canResend || submitting || resendLimitReached) {
      return;
    }

    if (remainingResendAttempts <= 0) {
      redirectAfterOtpLimit();
      return;
    }

    setSubmitting(true);
    requestInFlightRef.current = true;

    try {
      const result = await registerStart(email.trim().toLowerCase(), name.trim(), password, branchId, true);
      const nextRemainingAttempts = Math.max(
        0,
        Number(result?.resend_attempts_remaining ?? remainingResendAttempts - 1)
      );

      setRemainingResendAttempts(nextRemainingAttempts);
      setCode('');
      setRemainingOtpVerificationAttempts(MAX_OTP_VERIFICATION_ATTEMPTS);
      setOtpCodeExhausted(false);
      setResendTimer(nextRemainingAttempts === 0 ? 0 : RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      if (typeof err.response?.data?.resend_attempts_remaining === 'number') {
        setRemainingResendAttempts(err.response.data.resend_attempts_remaining);
      }

      setError(formatErrorText(err.response?.data?.message || 'Failed to resend OTP.'));
    } finally {
      requestInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    if (requestInFlightRef.current) {
      return;
    }

    setError('');

    if (otpCodeExhausted) {
      setError('OTP verification failed. Please request a new code.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter the OTP code.');
      return;
    }

    if (code.trim().length !== 6) {
      setError('OTP code must be 6 digits.');
      return;
    }

    setSubmitting(true);
    requestInFlightRef.current = true;

    try {
      const result = await registerVerify(email.trim().toLowerCase(), code);
      navigation.replace('Login', { prefilledEmail: result.email });
    } catch (err) {
      const responseData = err.response?.data || {};
      const message = responseData.message || 'Verification failed.';

      if ((responseData.locked || err.response?.status === 429) && resendLimitReached) {
        const locallyRemainingAttempts = Math.max(0, remainingOtpVerificationAttempts - 1);

        if (locallyRemainingAttempts > 0) {
          handleInvalidOtpAttempt(locallyRemainingAttempts);
          return;
        }

        startOtpLockoutRedirect(responseData, message);
        return;
      }

      if (typeof responseData.attempts_remaining === 'number') {
        const attemptsRemaining = resendLimitReached
          ? Math.max(responseData.attempts_remaining, remainingOtpVerificationAttempts - 1)
          : responseData.attempts_remaining;
        handleInvalidOtpAttempt(attemptsRemaining);
        return;
      }

      if (responseData.code_exhausted || responseData.locked || err.response?.status === 429) {
        handleInvalidOtpAttempt(remainingOtpVerificationAttempts - 1);
        return;
      }

      if (message === 'Invalid code') {
        handleInvalidOtpAttempt(remainingOtpVerificationAttempts - 1);
        return;
      }

      setError(formatErrorText(message));
    } finally {
      requestInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  const fieldErrors = step === 'form' ? getFormFieldErrors() : {};
  const visibleFieldError = step === 'form' ? getFirstVisibleFormError(fieldErrors) : '';
  const formError = step === 'form' ? visibleFieldError || error : error;
  const nameHasError = Boolean(fieldErrors.name && shouldShowFieldError('name'));
  const emailHasError = Boolean(fieldErrors.email && shouldShowFieldError('email'));
  const branchHasError = Boolean(fieldErrors.branch && hasSubmittedForm);
  const passwordHasError = Boolean(fieldErrors.password && shouldShowFieldError('password'));
  const confirmPasswordHasError = Boolean(
    fieldErrors.confirmPassword && shouldShowFieldError('confirmPassword')
  );

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

            <Text style={styles.appTitle}>ToothConnect</Text>
            <Text style={styles.appSubtitle}>Your dental care, connected.</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.registerCard}>
            {step === 'otp' ? (
              <TouchableOpacity
                onPress={handleBackToForm}
                style={styles.backButton}
                disabled={submitting}
              >
                <Text style={styles.backButtonText}>‹</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.title}>
              {step === 'form' ? 'CREATE ACCOUNT' : 'ENTER THE CODE'}
            </Text>

            <Text style={styles.subtitle}>
              {step === 'form'
                ? 'Sign up to book appointments'
                : 'A 6-digit code was sent to your email address.'}
            </Text>

            {step === 'otp' ? <View style={styles.formDivider} /> : null}

            {step === 'form' ? (
              <>
                <Text style={[styles.label, nameHasError && styles.labelError]}>
                  Full Name{nameHasError ? ' *' : ''}
                </Text>
                <TextInput
                  style={[styles.input, nameHasError && styles.inputError]}
                  value={name}
                  onChangeText={value => {
                    setName(value);
                    touchField('name');
                    setError('');
                  }}
                  onBlur={() => touchField('name')}
                  placeholder="e.g. Mary Ortega"
                  placeholderTextColor="#b8b8b8"
                />

                <Text style={[styles.label, emailHasError && styles.labelError]}>
                  Email{emailHasError ? ' *' : ''}
                </Text>
                <TextInput
                  style={[styles.input, emailHasError && styles.inputError]}
                  value={email}
                  onChangeText={value => {
                    setEmail(value);
                    touchField('email');
                    setHasActiveOtpFlow(false);
                    setRemainingResendAttempts(MAX_RESEND_ATTEMPTS);
                    setRemainingOtpVerificationAttempts(MAX_OTP_VERIFICATION_ATTEMPTS);
                    setOtpCodeExhausted(false);
                    setError('');
                  }}
                  onBlur={() => touchField('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="e.g. mary@gmail.com"
                  placeholderTextColor="#b8b8b8"
                />

                <Text style={[styles.label, branchHasError && styles.labelError]}>
                  Home Branch{branchHasError ? ' *' : ''}
                </Text>
                <View style={styles.branchPicker}>
                  {branchesLoading ? (
                    <Text style={styles.branchStatusText}>Loading branches...</Text>
                  ) : branchesError ? (
                    <Text style={styles.branchStatusText}>{branchesError}</Text>
                  ) : branches.length === 0 ? (
                    <Text style={styles.branchStatusText}>No branches available.</Text>
                  ) : branches.map(b => {
                    const isActive = branchId === b.id;

                    return (
                      <TouchableOpacity
                        key={b.id}
                        onPress={() => {
                          setBranchId(b.id);
                          setError('');
                        }}
                        style={[
                          styles.branchChip,
                          isActive && styles.branchChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.branchChipText,
                            isActive && styles.branchChipTextActive,
                          ]}
                        >
                          {b.name}
                        </Text>
                        {b.address ? (
                          <Text
                            style={[
                              styles.branchChipAddress,
                              isActive && styles.branchChipAddressActive,
                            ]}
                          >
                            {b.address}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.label, passwordHasError && styles.labelError]}>
                  Password{passwordHasError ? ' *' : ''}
                </Text>
                <View style={[styles.passwordWrapper, passwordHasError && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={value => {
                      setPassword(value);
                      touchField('password');
                      setError('');
                    }}
                    onBlur={() => touchField('password')}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    placeholder="Letters and numbers only"
                    placeholderTextColor="#b8b8b8"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.label, confirmPasswordHasError && styles.labelError]}>
                  Confirm Password{confirmPasswordHasError ? ' *' : ''}
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    confirmPasswordHasError && styles.inputError,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={value => {
                      setConfirmPassword(value);
                      touchField('confirmPassword');
                      setError('');
                    }}
                    onBlur={() => touchField('confirmPassword')}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    placeholderTextColor="#b8b8b8"
                  />

                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeText}>
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {formError ? <Text style={styles.error}>{formError}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleStart}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? 'SENDING OTP...' : 'SEND OTP'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.link}
                  disabled={submitting}
                >
                  <Text style={styles.linkText}>
                    Already have an account?{' '}
                    <Text style={styles.linkHighlight}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.otpInput}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  placeholderTextColor="#b8b8b8"
                />

                <View style={styles.resendRow}>
                  <Text style={styles.resendQuestion}>Didn’t receive a code?</Text>

                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={!canResend || submitting || resendLimitReached}
                  >
                    <Text
                      style={[
                        styles.resendText,
                        (!canResend || resendLimitReached) && { opacity: 0.5 },
                      ]}
                    >
                      {resendLimitReached
                        ? 'Resend Limit Reached'
                        : canResend
                          ? `Resend Code (${remainingResendAttempts})`
                          : `Resend in ${resendTimer}s (${remainingResendAttempts})`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error ? (
                  <Text style={styles.error}>
                    {otpRedirectSeconds !== null
                      ? `Too many incorrect attempts. You will be redirected to the login page in ${otpRedirectSeconds} seconds.`
                      : error}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.button,
                    (submitting || otpCodeExhausted || otpRedirectSeconds !== null) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleVerify}
                  disabled={submitting || otpCodeExhausted || otpRedirectSeconds !== null}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? 'VERIFYING...' : 'VERIFY OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
