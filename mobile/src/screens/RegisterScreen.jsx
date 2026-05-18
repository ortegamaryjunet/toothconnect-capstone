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
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import styles from '../styles/RegisterScreen';

const RESEND_WAIT_SECONDS = 60;
const MAX_RESEND_ATTEMPTS = 3;

export default function RegisterScreen({ navigation }) {
  const { registerStart, registerVerify } = useAuth();

  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);

  useEffect(() => {
    loadBranches();
  }, []);

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

  async function loadBranches() {
    try {
      const res = await api.get('/auth/branches');
      setBranches(res.data.branches);
    } catch (err) {
      // silent — handled when user tries to submit
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

  function isValidPassword(value) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(value);
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

  async function handleStart() {
    setError('');

    if (!isValidFullName(name)) {
      setError('Please enter your full name. Use first name and last name.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!branchId) {
      setError('Please pick your preferred branch');
      return;
    }

    if (!isValidPassword(password)) {
      setError(
        'Password must be at least 8 characters and include both letters and numbers. Special characters are not allowed.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      await registerStart(email.trim().toLowerCase(), name.trim(), password, branchId);

      setStep('otp');
      setCode('');
      setResendAttempts(0);
      setResendTimer(RESEND_WAIT_SECONDS);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      await registerStart(email.trim().toLowerCase(), name.trim(), password, branchId);

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
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    setError('');

    if (!code.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (code.trim().length !== 6) {
      setError('OTP code must be 6 digits');
      return;
    }

    setSubmitting(true);

    try {
      const result = await registerVerify(email.trim().toLowerCase(), code);
      navigation.replace('Login', { prefilledEmail: result.email });
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';

      if (
        message.toLowerCase().includes('too many') ||
        message.toLowerCase().includes('attempt')
      ) {
        navigation.replace('Login', {
          prefilledEmail: email.trim().toLowerCase(),
          otpFailed: true,
        });
        return;
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
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

          <View style={styles.registerCard}>
            {step === 'otp' ? (
              <TouchableOpacity
                onPress={() => setStep('form')}
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
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Mary Ortega"
                  placeholderTextColor="#b8b8b8"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="e.g. mary@gmail.com"
                  placeholderTextColor="#b8b8b8"
                />

                <Text style={styles.label}>Home Branch</Text>
                <View style={styles.branchPicker}>
                  {branches.map(b => {
                    const isActive = branchId === b.id;

                    return (
                      <TouchableOpacity
                        key={b.id}
                        onPress={() => setBranchId(b.id)}
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
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
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

                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

                {error ? <Text style={styles.error}>{error}</Text> : null}

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
                  onPress={handleVerify}
                  disabled={submitting}
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