import { useState } from 'react';
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
import styles from '../styles/ResetPasswordScreen';

export default function ResetPasswordScreen({ navigation, route }) {
  const email = route?.params?.email || '';
  const code = route?.params?.code || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function getPasswordValidationError(value) {
    if (!value) {
      return 'This field is required';
    }

    if (/\s/.test(value) || /[^A-Za-z\d]/.test(value)) {
      return 'Password must not contain spaces or special characters.';
    }

    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }

    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
      return 'Password must contain at least one letter and one number';
    }

    return '';
  }

  async function handleResetPassword() {
    setError('');

    if (!email || !code) {
      setError('Reset session is missing. Please request a new OTP.');
      return;
    }

    const newPasswordError = getPasswordValidationError(newPassword);
    if (newPasswordError) {
      setError(newPasswordError);
      return;
    }

    const confirmPasswordError = getPasswordValidationError(confirmPassword);
    if (confirmPasswordError) {
      setError(confirmPasswordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });

      navigation.replace('Login', {
        prefilledEmail: email,
        resetSuccess: true,
      });
    } catch (err) {
      setError(formatErrorText(err.response?.data?.message || 'Password reset failed.'));
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

            <Text style={styles.appTitle}>ToothConnect</Text>
            <Text style={styles.appSubtitle}>Your dental care, connected.</Text>
            <View style={styles.titleLine} />
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword', { prefilledEmail: email })}
              style={styles.backButton}
              disabled={submitting}
            >
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.screenTitle}>RESET PASSWORD</Text>

            <View style={styles.formDivider} />

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoComplete="new-password"
                placeholderTextColor="#b8b8b8"
              />

              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
                disabled={submitting}
              >
                <Text style={styles.eyeText}>
                  {showNewPassword ? 'Hide' : 'Show'}
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
                placeholderTextColor="#b8b8b8"
              />

              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={submitting}
              >
                <Text style={styles.eyeText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? 'RESETTING...' : 'RESET'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
