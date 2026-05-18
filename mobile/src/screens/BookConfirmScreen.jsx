import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatRelativeDate, formatTimeOnly } from '../utils/datetime';
import styles from '../styles/BookConfirmScreen';
import { createAppointment } from '../api/appointments';

export default function BookConfirmScreen({ navigation, route }) {
  const { service, branchId, branchName, suggestion, rescheduleAppointmentId } = route.params;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [newAppointmentId, setNewAppointmentId] = useState(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    try {
      const startISO = suggestion.start_time.replace(' ', 'T') + 'Z';
      const result = await createAppointment({
        branch_id: branchId,
        dentist_id: suggestion.dentist_id,
        service_id: service.id,
        start_time: startISO,
        ...(rescheduleAppointmentId ? { reschedule_appointment_id: rescheduleAppointmentId } : {}),
      });
      setNewAppointmentId(result?.id ?? null);
      setSuccessModalVisible(true);
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

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.reviewText}>
          Please review your appointment details{'\n'}before confirming.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>When</Text>
            <View style={styles.summaryValueArea}>
              <Text style={styles.summaryValueBig}>
                {formatRelativeDate(suggestion.start_time)}
              </Text>
              <Text style={styles.summaryValueTime}>
                {formatTimeOnly(suggestion.start_time)}
              </Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service</Text>
            <Text style={styles.summaryValue}>
              {service.name} · {service.duration_min} min
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Dentist</Text>
            <Text style={styles.summaryValue}>{suggestion.dentist_name}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Branch</Text>
            <Text style={styles.summaryValue}>{branchName}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated cost</Text>
            <Text style={styles.summaryValue}>₱{Number(service.price).toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={submitting}
            style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
          >
            <Text style={styles.confirmButtonText}>
              {submitting ? 'Booking...' : 'Confirm appointment'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCancelModalVisible(true)}
            style={styles.cancelLink}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <Pressable style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {rescheduleAppointmentId ? 'Appointment rescheduled' : 'Successfully booked appointment'}
            </Text>
            <Text style={styles.modalMessage}>
              {rescheduleAppointmentId
                ? 'Your appointment has been rescheduled successfully.'
                : 'Your appointment has been confirmed.'}
            </Text>

            <TouchableOpacity
              style={styles.modalOkButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('Appointments', {
                  highlightAppointmentId: newAppointmentId,
                });
              }}
            >
              <Text style={styles.modalOkButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCancelModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Cancel booking?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel?
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalYesButton}
                onPress={() => {
                  setCancelModalVisible(false);
                  navigation.navigate('Appointments');
                }}
              >
                <Text style={styles.modalYesButtonText}>Yes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalNoButton}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalNoButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}