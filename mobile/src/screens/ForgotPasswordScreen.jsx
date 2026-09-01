import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import { formatErrorText } from '../utils/errors';
import styles from '../styles/ForgotPasswordScreen';

const RESEND_WAIT_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;
const MAX_OTP_VERIFICATION_ATTEMPTS = 3;
const OTP_LOCK_REDIRECT_SECONDS = 5;
const PASSWORD_RESET_LOCKOUT_MESSAGE =
  'Too many failed attempts. Please wait 5 minutes before trying to change your password again.';

export default function ForgotPasswordScreen({ navigation, route }) {
  const requestInFlightRef = useRef(false);
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(route?.params?.prefilledEmail || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [remainingResendAttempts, setRemainingResendAttempts] = useState(MAX_RESEND_ATTEMPTS);
  const [remainingOtpVerificationAttempts, setRemainingOtpVerificationAttempts] = useState(
    MAX_OTP_VERIFICATION_ATTEMPTS
  );
  const [otpCodeExhausted, setOtpCodeExhausted] = useState(false);
  const [otpRedirectSeconds, setOtpRedirectSeconds] = useState(null);
  const [otpLockoutSeconds, setOtpLockoutSeconds] = useState(0);
  const [otpLockoutMessage, setOtpLockoutMessage] = useState(PASSWORD_RESET_LOCKOUT_MESSAGE);
  const [resetFlowStartedAt, setResetFlowStartedAt] = useState('');
  const resendLimitReached = remainingResendAttempts === 0;

  useEffect(() => {
    if (route?.params?.prefilledEmail) {
      setEmail(route.params.prefilledEmail);
    }
  }, [route?.params?.prefilledEmail]);

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
        passwordResetOtpLocked: true,
        passwordResetCooldownSeconds: otpLockoutSeconds,
        passwordResetCooldownUntil: Date.now() + Number(otpLockoutSeconds || 5 * 60) * 1000,
        passwordResetCooldownMessage: otpLockoutMessage,
      });
      return undefined;
    }

    const timer = setTimeout(() => {
      setOtpRedirectSeconds(current => Math.max(0, Number(current || 0) - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [email, navigation, otpLockoutMessage, otpLockoutSeconds, otpRedirectSeconds]);

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  }

  function getForgotPasswordEmailError(message) {
    if (message === 'No account found with this email address.') {
      return 'Email Address does not exist.';
    }

    return formatErrorText(message || 'Unable to send OTP. Please try again.');
  }

  function getApiErrorMessage(err, fallback) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
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
    setOtpLockoutSeconds(Number(responseData.login_retry_after_seconds || 5 * 60));
    setOtpLockoutMessage(responseData.login_message || PASSWORD_RESET_LOCKOUT_MESSAGE);
    setOtpRedirectSeconds(OTP_LOCK_REDIRECT_SECONDS);
    setError(formatErrorText(`${message} (${OTP_LOCK_REDIRECT_SECONDS})`));
  }

  async function handleSendOtp() {
    if (requestInFlightRef.current) {
      return;
    }

    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    requestInFlightRef.current = true;

    try {
      const result = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        platform: 'mobile',
      });

      setStep('otp');
      setCode('');
      setRemainingResendAttempts(
        Number(result.data?.resend_attempts_remaining ?? MAX_RESEND_ATTEMPTS)
      );
      setRemainingOtpVerificationAttempts(MAX_OTP_VERIFICATION_ATTEMPTS);
      setOtpCodeExhausted(false);
      setOtpRedirectSeconds(null);
      setOtpLockoutSeconds(0);
      setOtpLockoutMessage(PASSWORD_RESET_LOCKOUT_MESSAGE);
      setResetFlowStartedAt(result.data?.reset_flow_started_at || new Date().toISOString());
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(getForgotPasswordEmailError(getApiErrorMessage(err, 'Unable to send OTP. Please try again.')));
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

    setSubmitting(true);
    requestInFlightRef.current = true;

    try {
      const result = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        platform: 'mobile',
        is_resend: true,
        reset_flow_started_at: resetFlowStartedAt,
      });

      const nextRemainingAttempts = Math.max(
        0,
        Number(result.data?.resend_attempts_remaining ?? remainingResendAttempts - 1)
      );

      setRemainingResendAttempts(nextRemainingAttempts);
      setCode('');
      setRemainingOtpVerificationAttempts(MAX_OTP_VERIFICATION_ATTEMPTS);
      setOtpCodeExhausted(false);
      setResetFlowStartedAt(result.data?.reset_flow_started_at || resetFlowStartedAt);
      setResendTimer(nextRemainingAttempts === 0 ? 0 : RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      const responseData = err.response?.data || {};
      if (typeof responseData.resend_attempts_remaining === 'number') {
        setRemainingResendAttempts(responseData.resend_attempts_remaining);
      }

      if (err.response?.status === 429) {
        setRemainingResendAttempts(0);
        setCanResend(false);

        if (responseData.message === 'OTP resend limit reached. Please wait before requesting another code.') {
          return;
        }
      }

      setError(formatErrorText(getApiErrorMessage(err, 'Unable to resend OTP. Please try again.')));
    } finally {
      requestInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
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
      await api.post('/auth/reset-password/verify', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        reset_flow_started_at: resetFlowStartedAt,
      });

      navigation.navigate('ResetPassword', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
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

  function getTitle() {
    if (step === 'email') return 'FORGOT PASSWORD';
    return 'ENTER THE CODE';
  }

  function getSubtitle() {
    if (step === 'email') {
      return 'Please enter your registered email to receive your One-Time Password (OTP) to reset your password.';
    }

    return 'A 6-digit code was sent to your email address.';
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

            <Text style={styles.appTitle}>ToothConnect</Text>
            <Text style={styles.appSubtitle}>Your dental care, connected.</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => {
                setError('');

                if (step === 'email') {
                  navigation.navigate('Login', route?.params?.returnToLoginParams);
                } else {
                  setStep('email');
                  setCode('');
                  setOtpRedirectSeconds(null);
                  setOtpLockoutSeconds(0);
                  setOtpLockoutMessage(PASSWORD_RESET_LOCKOUT_MESSAGE);
                  setResetFlowStartedAt('');
                }
              }}
              style={styles.backButton}
              disabled={submitting || otpRedirectSeconds !== null}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.screenTitle}>{getTitle()}</Text>

            <Text style={styles.screenSubtitle}>{getSubtitle()}</Text>

            <View style={styles.formDivider} />

            {step === 'email' ? (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholderTextColor="#b8b8b8"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? 'SENDING OTP...' : 'SEND OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {step === 'otp' ? (
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
                  onPress={handleVerifyOtp}
                  disabled={submitting || otpCodeExhausted || otpRedirectSeconds !== null}
                >
                  <Text style={styles.buttonText}>VERIFY OTP</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
