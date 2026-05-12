import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import api from '../api/axios';
import styles from '../styles/RegisterScreen';

export default function RegisterScreen({ navigation }) {
  const { registerStart, registerVerify } = useAuth();
  const [step, setStep] = useState('form');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    try {
      const res = await api.get('/auth/branches');
      setBranches(res.data.branches);
    } catch (err) {
      // silent — handled when user tries to submit
    }
  }

  async function handleStart() {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!branchId) {
      setError('Please pick your preferred branch');
      return;
    }
    setSubmitting(true);
    try {
      await registerStart(email.trim().toLowerCase(), name.trim(), password, branchId);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.inner}>
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

              <Text style={styles.label}>Preferred branch</Text>
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
                      <Text style={[
                        styles.branchChipText,
                        isActive && styles.branchChipTextActive,
                      ]}>
                        {b.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}