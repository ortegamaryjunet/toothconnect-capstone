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
import styles from '../styles/LoginScreen';

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const [email, setEmail] = useState(route?.params?.prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showMessage, setShowMessage] = useState(!!route?.params?.prefilledEmail);

  useEffect(() => {
    if (route?.params?.prefilledEmail) {
      setEmail(route.params.prefilledEmail);
      setShowMessage(true);
    }
  }, [route?.params?.prefilledEmail]);

  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showMessage]);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect email or password.');
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

            {showMessage && route?.params?.prefilledEmail ? (
              <View
                style={[
                  styles.successBox,
                  route?.params?.otpFailed && styles.warningBox,
                ]}
              >
                <Text
                  style={[
                    styles.successText,
                    route?.params?.otpFailed && styles.warningText,
                  ]}
                >
                  {route?.params?.otpFailed
                    ? 'OTP verification unsuccessful. Please wait for a few minutes and try again.'
                    : route?.params?.resetSuccess
                      ? 'Password has been reset. Please log in with your new password.'
                      : 'Registration complete. Please log in with your registered account.'}
                </Text>
              </View>
            ) : null}

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

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
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
                })
              }
              disabled={submitting}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? 'SIGNING IN...' : 'SIGN IN'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.link}
              disabled={submitting}
            >
              <Text style={styles.linkText}>
                Don’t have an account?{' '}
                <Text style={styles.linkHighlight}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
