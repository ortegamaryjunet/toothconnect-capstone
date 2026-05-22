import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import styles from '../styles/ForgotPasswordScreen';

const RESEND_WAIT_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;

export default function ForgotPasswordScreen({ navigation, route }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(route?.params?.prefilledEmail || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    if (route?.params?.prefilledEmail) {
      setEmail(route.params.prefilledEmail);
    }
  }, [route?.params?.prefilledEmail]);

  useEffect(() => {
    let interval;

    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }

    if (step === 'otp' && resendTimer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  function isValidEmail(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
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

  async function handleSendOtp() {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        platform: 'mobile',
      });

      setStep('otp');
      setCode('');
      setResendAttempts(0);
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setError('');

    if (!canResend || submitting) {
      return;
    }

    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      redirectAfterOtpLimit();
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
        platform: 'mobile',
      });

      const nextAttempts = resendAttempts + 1;

      if (nextAttempts >= MAX_RESEND_ATTEMPTS) {
        redirectAfterOtpLimit();
        return;
      }

      setResendAttempts(nextAttempts);
      setCode('');
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to resend OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    setError('');

    if (!code.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (code.trim().length !== 6) {
      setError('OTP code must be 6 digits');
      return;
    }

    navigation.navigate('ResetPassword', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.inner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                  navigation.navigate('Login');
                } else {
                  setStep('email');
                }
              }}
              style={styles.backButton}
              disabled={submitting}
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
                    disabled={!canResend || submitting}
                  >
                    <Text
                      style={[
                        styles.resendText,
                        !canResend && { opacity: 0.5 },
                      ]}
                    >
                      {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                    </Text>
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={submitting}
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
