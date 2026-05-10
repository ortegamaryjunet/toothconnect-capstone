import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatRelativeDate, formatTimeOnly } from '../utils/datetime';
import styles from '../styles/BookConfirmScreen';
import { createAppointment } from '../api/appointments';

export default function BookConfirmScreen({ navigation, route }) {
  const { service, branchId, branchName, suggestion } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      const startISO = suggestion.start_time.replace(' ', 'T') + 'Z';
      await createAppointment({
        branch_id: branchId,
        dentist_id: suggestion.dentist_id,
        service_id: service.id,
        start_time: startISO,
      });
      Alert.alert(
        'Booked!',
        'Your appointment is confirmed.',
        [{ text: 'OK', onPress: () => navigation.popToTop() }]
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book');
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm appointment</Text>
      </View>

      <ScrollView style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>When</Text>
            <Text style={styles.summaryValueBig}>
              {formatRelativeDate(suggestion.start_time)}
            </Text>
            <Text style={styles.summaryValue}>{formatTimeOnly(suggestion.start_time)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>
              {service.name} · {service.duration_min} min
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dentist</Text>
            <Text style={styles.summaryValue}>{suggestion.dentist_name}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Branch</Text>
            <Text style={styles.summaryValue}>{branchName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated cost</Text>
            <Text style={styles.summaryValue}>₱{Number(service.price).toFixed(0)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={submitting}
          style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
        >
          <Text style={styles.confirmButtonText}>
            {submitting ? 'Booking...' : 'Confirm appointment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.cancelLink}>
          <Text style={styles.cancelLinkText}>Cancel and start over</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}