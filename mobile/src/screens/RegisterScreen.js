import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { registerStart, registerVerify } = useAuth();
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleStart() {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await registerStart(email.trim().toLowerCase(), name.trim(), password);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    setError('');
    setSubmitting(true);
    try {
      await registerVerify(email.trim().toLowerCase(), code);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.title}>{step === 'form' ? 'Create account' : 'Verify email'}</Text>
        <Text style={styles.subtitle}>
          {step === 'form'
            ? 'Sign up to book appointments'
            : `Enter the 6-digit code sent to ${email}`}
        </Text>

        {step === 'form' ? (
          <>
            <Text style={styles.label}>Full name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password (min 8 characters)</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleStart} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Sending OTP...' : 'Send OTP'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>OTP code</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Verifying...' : 'Verify and continue'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('form')} style={styles.link}>
              <Text style={styles.linkText}>Back to details</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: '600', color: '#1a365d', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  label: { fontSize: 12, color: '#4a5568', marginBottom: 4, marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e0',
    borderRadius: 8, padding: 12, fontSize: 14, marginBottom: 8,
  },
  error: {
    backgroundColor: '#fed7d7', color: '#9b2c2c',
    padding: 10, borderRadius: 6, fontSize: 13, marginTop: 8, marginBottom: 8,
  },
  button: {
    backgroundColor: '#3182ce', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#3182ce', fontSize: 13 },
});