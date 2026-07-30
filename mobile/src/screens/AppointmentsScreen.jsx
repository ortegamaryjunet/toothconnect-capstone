import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AppSidebar from '../components/AppSidebar';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import {
  listAppointments,
  cancelAppointment,
  getAppointmentFeedback,
  submitAppointmentFeedback,
  getCancellationPolicy,
} from '../api/appointments';
import { getUnreadCount } from '../api/notifications';
import { getCloudinarySignature, uploadPaymentReceipt } from '../api/payments';
import { getBranchCity } from '../utils/branch';
import { formatDateTime, formatRelativeDate, formatTimeOnly } from '../utils/datetime';
import { isCancellationLocked } from '../utils/appointments';
import styles from '../styles/AppointmentsScreen';

const CANCEL_REASONS = [
  { key: 'schedule', label: "Something came up, can't make it" },
  { key: 'feeling', label: "I'm feeling better, no longer needed" },
  { key: 'cost', label: 'Cost concerns' },
  { key: 'other', label: 'Other reason' },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
];

const HISTORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'missed', label: 'Missed' },
];

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;
const RECEIPT_PICKER_QUALITY = 0.72;
const DEFAULT_CANCELLATION_POLICY =
  'Please contact the clinic as soon as possible if you need to cancel or reschedule your appointment.';

export default function AppointmentsScreen({ navigation, route }) {
  const { user } = useAuth();
  const sidebarRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeAppointmentTab, setActiveAppointmentTab] = useState('upcoming');

  const [cancelModal, setCancelModal] = useState({ visible: false, appointment: null });
  const [selectedReason, setSelectedReason] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState({
    visible: false,
    appointment: null,
    reason: '',
    error: '',
  });

  const [ratingModal, setRatingModal] = useState({ visible: false, appointment: null, step: 'loading', existingFeedback: null });
  const [ratingValue, setRatingValue] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [uploadingReceiptId, setUploadingReceiptId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [cancellationPolicyMessage, setCancellationPolicyMessage] = useState(DEFAULT_CANCELLATION_POLICY);
  const highlightTimerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchUnreadCount();
      fetchCancellationPolicy();
    }, [])
  );

  useEffect(() => {
    const highlightId = route?.params?.highlightAppointmentId;
    if (!highlightId) return;
    const numId = Number(highlightId);
    setExpandedId(numId);
    setHighlightedId(numId);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlightedId(null), 5000);
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [route?.params?.highlightAppointmentId]);

  useEffect(() => {
    const highlightId = route?.params?.highlightAppointmentId;
    if (!highlightId || appointments.length === 0) return;
    const numId = Number(highlightId);
    const target = appointments.find((a) => a.id === numId);
    if (!target) return;
    if (['cancelled', 'canceled', 'completed', 'no_show'].includes(target.status)) {
      setActiveAppointmentTab('completed');
    } else if (['scheduled', 'arrived'].includes(target.status)) {
      setActiveAppointmentTab('upcoming');
    }
  }, [appointments, route?.params?.highlightAppointmentId]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const data = await listAppointments();
      const now = new Date();
      const visibleAppointments = data.filter(
        (a) =>
          (a.status === 'scheduled' && new Date(a.start_time) >= now) ||
          a.status === 'arrived' ||
          a.status === 'completed' ||
          a.status === 'cancelled' ||
          a.status === 'canceled' ||
          a.status === 'no_show'
      ).sort((a, b) => {
        if (['scheduled', 'arrived'].includes(a.status) && !['scheduled', 'arrived'].includes(b.status)) return -1;
        if (!['scheduled', 'arrived'].includes(a.status) && ['scheduled', 'arrived'].includes(b.status)) return 1;
        return new Date(a.start_time) - new Date(b.start_time);
      });
      setAppointments(visibleAppointments);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnreadCount() {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }

  async function fetchCancellationPolicy() {
    try {
      const policy = await getCancellationPolicy();
      setCancellationPolicyMessage(policy?.message || DEFAULT_CANCELLATION_POLICY);
    } catch {
      setCancellationPolicyMessage(DEFAULT_CANCELLATION_POLICY);
    }
  }

  function getFilteredAppointments() {
    const now = new Date();
    if (filter === 'week') {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + (7 - now.getDay()));
      weekEnd.setHours(23, 59, 59);
      return appointments.filter((a) => new Date(a.start_time) <= weekEnd);
    }
    if (filter === 'month') {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return appointments.filter((a) => new Date(a.start_time) <= monthEnd);
    }
    return appointments;
  }

  function groupByMonth(appts) {
    const groups = {};
    appts.forEach((a) => {
      const key = new Date(a.start_time).toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });
    return groups;
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function openCancelModal(appointment) {
    if (isCancellationLocked(appointment)) return;
    setSelectedReason(null);
    setCancelModal({ visible: true, appointment });
  }

  function openRescheduleModal(appointment) {
    setRescheduleModal({
      visible: true,
      appointment,
      reason: '',
      error: '',
    });
  }

  function closeRescheduleModal() {
    setRescheduleModal({
      visible: false,
      appointment: null,
      reason: '',
      error: '',
    });
  }

  function handleContinueReschedule() {
    const reason = rescheduleModal.reason.trim();
    const appointment = rescheduleModal.appointment;
    if (!appointment) return;

    if (!reason) {
      setRescheduleModal((prev) => ({
        ...prev,
        error: 'Please enter your reason for rescheduling.',
      }));
      return;
    }

    closeRescheduleModal();
    navigation.navigate('BookSuggestions', {
      service: {
        id: appointment.service_id,
        name: appointment.service_name,
        duration_min: appointment.duration_min,
        price: appointment.price ?? appointment.service_price,
      },
      branchId: appointment.branch_id,
      branchName: getAppointmentBranchCity(appointment),
      rescheduleAppointmentId: appointment.id,
      rescheduleReason: reason,
    });
  }

  async function handleUploadReceipt(appointment) {
    if (!canUploadReceipt(appointment)) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow gallery access to upload your payment receipt.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: RECEIPT_PICKER_QUALITY,
        base64: false,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const optimizedAsset = normalizeReceiptAsset(result.assets[0], appointment.id);
      const validationError = validateReceiptAsset(optimizedAsset);
      if (validationError) {
        Alert.alert('Invalid receipt file', validationError);
        return;
      }

      setUploadingReceiptId(appointment.id);

      const signature = await getCloudinarySignature({
        folder: 'toothconnect/payment-receipts',
      });
      const uploadResult = await uploadReceiptToCloudinary(optimizedAsset, signature);

      await uploadPaymentReceipt({
        appointment_id: appointment.id,
        amount: Number(appointment.payment_amount ?? appointment.service_price ?? 0),
        payment_method: appointment.payment_method,
        ewallet_provider: appointment.ewallet_provider || null,
        reference_number: appointment.reference_number || null,
        receipt_url: uploadResult.secure_url,
        receipt_public_id: uploadResult.public_id,
        receipt_file_name: optimizedAsset.fileName,
        receipt_mime_type: optimizedAsset.mimeType,
        paid_at: new Date().toISOString(),
      });

      Alert.alert('Receipt uploaded', 'Your receipt is waiting for receptionist acknowledgement.');
      fetchAppointments();
    } catch (err) {
      Alert.alert(
        'Upload failed',
        err.response?.data?.message || err.message || 'Failed to upload receipt.'
      );
    } finally {
      setUploadingReceiptId(null);
    }
  }

  function closeCancelModal() {
    setCancelModal({ visible: false, appointment: null });
    setSelectedReason(null);
  }

  async function handleConfirmCancel() {
    if (!selectedReason || !cancelModal.appointment) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelModal.appointment.id, { reason: selectedReason });
      closeCancelModal();
      fetchAppointments();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  }

  async function openRatingModal(appointment) {
    setRatingValue(0);
    setFeedbackText('');
    setRatingModal({ visible: true, appointment, step: 'loading', existingFeedback: null });
    try {
      const data = await getAppointmentFeedback(appointment.id);
      if (data.feedback) {
        setRatingModal({ visible: true, appointment, step: 'choose', existingFeedback: data.feedback });
      } else {
        setRatingModal({ visible: true, appointment, step: 'rate', existingFeedback: null });
      }
    } catch {
      setRatingModal({ visible: true, appointment, step: 'rate', existingFeedback: null });
    }
  }

  function closeRatingModal() {
    setRatingModal({ visible: false, appointment: null, step: 'loading', existingFeedback: null });
    setRatingValue(0);
    setFeedbackText('');
  }

  async function handleSubmitRating() {
    if (!ratingValue || !ratingModal.appointment) return;
    setRatingSubmitting(true);
    try {
      await submitAppointmentFeedback(ratingModal.appointment.id, {
        rating: ratingValue,
        feedback: feedbackText.trim() || null,
      });
      setRatingModal((prev) => ({ ...prev, step: 'success' }));
      setTimeout(() => closeRatingModal(), 2200);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setRatingSubmitting(false);
    }
  }

  function getAppointmentBranchCity(appointment) {
    return getBranchCity({
      name: appointment.branch_name,
      address: appointment.branch_address,
    });
  }

  function canUploadReceipt(appointment) {
    if (appointment.status !== 'completed') return false;
    if (!['ewallet', 'bank_transfer'].includes(appointment.payment_method)) return false;
    if (appointment.payment_status !== 'pending') return false;
    if (appointment.receipt_url) return false;
    return true;
  }

  function isRescheduledAppointment(appointment) {
    const note = String(
      appointment?.dentist_note ||
      appointment?.note ||
      appointment?.notes ||
      ''
    );

    return String(appointment?.status || '').toLowerCase() === 'scheduled' &&
      /(^|\n)\s*Rescheduled\s*:/i.test(note);
  }

  function renderAppointmentCard(appt) {
    const isNext =
      appt.status === 'scheduled' && appointments.indexOf(appt) === 0;
    const isExpanded = expandedId === appt.id;
    const isHighlighted = highlightedId === appt.id;
    const paymentTracker = getPaymentTracker(appt);
    const cancellationLocked = isCancellationLocked(appt);
    const isRescheduled = isRescheduledAppointment(appt);

    return (
      <View
        key={appt.id}
        style={[
          styles.apptCard,
          isNext && styles.apptCardNext,
          isHighlighted && { borderWidth: 2, borderColor: '#c88a11', backgroundColor: '#fffbf0' },
        ]}
      >
        {isNext && (
          <View style={styles.nextPillWrap}>
            <Text style={styles.nextPill}>Next appointment</Text>
          </View>
        )}

        <Text style={styles.apptDatetime}>
          {formatRelativeDate(appt.start_time)} · {formatTimeOnly(appt.start_time)}
        </Text>

        <Text style={styles.apptService}>{appt.service_name}</Text>

        <Text
          style={[
            styles.apptStatus,
            appt.status === 'completed' && styles.apptStatusCompleted,
            (appt.status === 'cancelled' || appt.status === 'canceled') && styles.apptStatusCancelled,
            appt.status === 'no_show' && styles.apptStatusMissed,
          ]}
        >
          {appt.status === 'completed'
            ? 'Completed'
            : appt.status === 'arrived'
              ? 'Arrived'
              : appt.status === 'no_show'
                ? 'Missed'
                : appt.status === 'cancelled' || appt.status === 'canceled'
                  ? 'Cancelled'
                  : isRescheduled
                    ? 'Rescheduled'
                    : 'Scheduled'}
        </Text>

        <View style={styles.paymentTracker}>
          <View
            style={[
              styles.paymentTrackerDot,
              paymentTracker.status === 'verified' && styles.paymentTrackerDotVerified,
              paymentTracker.status === 'pending' && styles.paymentTrackerDotPending,
              paymentTracker.status === 'waiting' && styles.paymentTrackerDotWaiting,
              paymentTracker.status === 'rejected' && styles.paymentTrackerDotRejected,
            ]}
          />
          <View style={styles.paymentTrackerTextArea}>
            <Text style={styles.paymentTrackerTitle}>
              {paymentTracker.title}
            </Text>
            {paymentTracker.detail ? (
              <Text style={styles.paymentTrackerDetail}>
                {paymentTracker.detail}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={() => toggleExpand(appt.id)}
        >
          <Text style={styles.viewDetailsBtnText}>
            {isExpanded ? '▲ Hide details' : '▼ View details'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detailsPanel}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Dentist</Text>
              <Text style={styles.detailVal}>{appt.dentist_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch</Text>
              <Text style={styles.detailVal}>{getAppointmentBranchCity(appt)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailVal}>{appt.duration_min} min</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated cost</Text>
              <Text style={styles.detailVal}>₱{Number(appt.price ?? appt.service_price ?? 0).toFixed(0)}</Text>
            </View>
            {(appt.status === 'cancelled' || appt.status === 'canceled') &&
              appt.cancellation_reason &&
              (appt.cancelled_by === 'receptionist' || appt.cancelled_by === 'admin') && (
              <View style={[styles.detailRow, { marginTop: 4 }]}>
                <Text style={[styles.detailLabel, { color: '#c53030' }]}>Cancellation reason</Text>
                <Text style={[styles.detailVal, { color: '#c53030', flex: 1 }]}>{appt.cancellation_reason}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.apptActions}>
          {appt.status === 'scheduled' && (
            <>
              <TouchableOpacity
                style={styles.btnReschedule}
                onPress={() => openRescheduleModal(appt)}
              >
                <Text style={styles.btnRescheduleText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCancel, cancellationLocked && styles.btnCancelDisabled]}
                onPress={() => openCancelModal(appt)}
                disabled={cancellationLocked}
              >
                <Text style={[styles.btnCancelText, cancellationLocked && styles.btnCancelTextDisabled]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.btnReceipt,
              !canUploadReceipt(appt) && styles.btnReceiptDisabled,
            ]}
            disabled={!canUploadReceipt(appt) || uploadingReceiptId === appt.id}
            onPress={() => handleUploadReceipt(appt)}
          >
            <Text
              style={[
                styles.btnReceiptText,
                !canUploadReceipt(appt) && styles.btnReceiptTextDisabled,
              ]}
            >
              {uploadingReceiptId === appt.id ? 'Uploading...' : 'Upload payment'}
            </Text>
          </TouchableOpacity>

          {appt.status === 'completed' && (
            <TouchableOpacity
              style={styles.btnRating}
              onPress={() => openRatingModal(appt)}
            >
              <Text style={styles.btnRatingText}>Rate & Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  function renderAppointmentSection(title, count, appts, emptyMessage) {
    return (
      <View style={styles.appointmentSection}>
        <View style={styles.appointmentSectionHeader}>
          <Text style={styles.appointmentSectionTitle}>{title}</Text>
          <Text style={styles.appointmentSectionCount}>{count}</Text>
        </View>

        {appts.length === 0 ? (
          <View style={styles.sectionEmptyBox}>
            <Text style={styles.sectionEmptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          appts.map((appt) => renderAppointmentCard(appt))
        )}
      </View>
    );
  }

  const upcomingAppointments = appointments.filter((a) =>
    ['scheduled', 'arrived'].includes(a.status)
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed');
  const cancelledAppointments = appointments.filter((a) =>
    a.status === 'cancelled' || a.status === 'canceled'
  );
  const missedAppointments = appointments.filter((a) => a.status === 'no_show');
  const completedHistoryAppointments = appointments.filter((a) =>
    a.status === 'completed' ||
    a.status === 'cancelled' ||
    a.status === 'canceled' ||
    a.status === 'no_show'
  );
  const pendingReceiptUploads = appointments.filter(canUploadReceipt);
  const filtered = getFilteredAppointments();

  const filteredUpcomingAppointments = filtered.filter((a) =>
    ['scheduled', 'arrived'].includes(a.status)
  );
  const filteredCompletedAppointments = filtered.filter((a) => {
    const isCompleted = a.status === 'completed';
    const isCancelled = a.status === 'cancelled' || a.status === 'canceled';
    const isMissed = a.status === 'no_show';
    if (historyFilter === 'completed') return isCompleted;
    if (historyFilter === 'cancelled') return isCancelled;
    if (historyFilter === 'missed') return isMissed;
    return isCompleted || isCancelled || isMissed;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.dashboardArea}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={() => sidebarRef.current?.open()}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Appointments</Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Top row */}
            <View style={styles.topRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Upcoming Appointments</Text>
                <Text style={styles.statValue}>{upcomingAppointments.length}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Completed History</Text>
                <Text style={styles.statValue}>{completedHistoryAppointments.length}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Completed Appointments</Text>
                <Text style={styles.statValue}>{completedAppointments.length}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Cancelled / Missed</Text>
                <Text style={styles.statValue}>{cancelledAppointments.length + missedAppointments.length}</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Pending Receipt Upload</Text>
                <Text style={styles.statValue}>{pendingReceiptUploads.length}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookCard}
              onPress={() => navigation.navigate('BookAIAssistant')}
            >
              <View style={styles.bookCardLeft}>
                <Text style={styles.bookCardTitle}>Book an appointment</Text>
                <Text style={styles.bookCardSub}>AI-suggested slots based on your history</Text>
              </View>
              <Text style={styles.bookCardArrow}>→</Text>
            </TouchableOpacity>

            {/* Filter chips */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.policyIconButton}
                onPress={() => setPolicyModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="View cancellation policy"
              >
                <Text style={styles.policyIconText}>!</Text>
              </TouchableOpacity>
            </View>

            {/* Appointment navigation */}
            <View style={styles.appointmentTabBar}>
              <TouchableOpacity
                style={[
                  styles.appointmentTab,
                  activeAppointmentTab === 'upcoming' && styles.appointmentTabActive,
                ]}
                onPress={() => { setActiveAppointmentTab('upcoming'); setHistoryFilter('all'); }}
              >
                <Text
                  style={[
                    styles.appointmentTabText,
                    activeAppointmentTab === 'upcoming' && styles.appointmentTabTextActive,
                  ]}
                >
                  Upcoming
                </Text>
                <Text
                  style={[
                    styles.appointmentTabCount,
                    activeAppointmentTab === 'upcoming' && styles.appointmentTabCountActive,
                  ]}
                >
                  {filteredUpcomingAppointments.length}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.appointmentTab,
                  activeAppointmentTab === 'completed' && styles.appointmentTabActive,
                ]}
                onPress={() => setActiveAppointmentTab('completed')}
              >
                <Text
                  style={[
                    styles.appointmentTabText,
                    activeAppointmentTab === 'completed' && styles.appointmentTabTextActive,
                  ]}
                >
                  History
                </Text>
                <Text
                  style={[
                    styles.appointmentTabCount,
                    activeAppointmentTab === 'completed' && styles.appointmentTabCountActive,
                  ]}
                >
                  {filteredCompletedAppointments.length}
                </Text>
              </TouchableOpacity>
            </View>

            {/* History sub-filters */}
            {activeAppointmentTab === 'completed' && (
              <View style={styles.filterRow}>
                {HISTORY_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setHistoryFilter(f.key)}
                    style={[styles.filterChip, historyFilter === f.key && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, historyFilter === f.key && styles.filterChipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Appointment list */}
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No appointments for this period.{'\n'}Tap "Book an appointment" to schedule one.
                </Text>
              </View>
            ) : activeAppointmentTab === 'upcoming' ? (
              renderAppointmentSection(
                'Upcoming Appointments',
                filteredUpcomingAppointments.length,
                filteredUpcomingAppointments,
                'No upcoming appointments for this period.'
              )
            ) : (
              renderAppointmentSection(
                historyFilter === 'completed' ? 'Completed Appointments'
                  : historyFilter === 'cancelled' ? 'Cancelled Appointments'
                  : historyFilter === 'missed' ? 'Missed Appointments'
                  : 'Appointment History',
                filteredCompletedAppointments.length,
                filteredCompletedAppointments,
                historyFilter === 'completed' ? 'No completed appointments for this period.'
                  : historyFilter === 'cancelled' ? 'No cancelled appointments for this period.'
                  : historyFilter === 'missed' ? 'No missed appointments for this period.'
                  : 'No completed, cancelled, or missed appointments for this period.'
              )
            )}
          </ScrollView>
        </View>

        <AppSidebar ref={sidebarRef} navigation={navigation} activeScreen="Appointments" />
      </View>

      {/* Cancel Modal */}
      <Modal
        visible={policyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPolicyModalVisible(false)}
      >
        <Pressable style={styles.policyModalOverlay} onPress={() => setPolicyModalVisible(false)}>
          <Pressable style={styles.policyModalCard} onPress={() => {}}>
            <View style={styles.policyModalIcon}>
              <Text style={styles.policyModalIconText}>!</Text>
            </View>
            <Text style={styles.policyModalTitle}>Cancellation Policy</Text>
            <Text style={styles.policyModalBody}>{cancellationPolicyMessage}</Text>
            <TouchableOpacity
              style={styles.policyModalButton}
              onPress={() => setPolicyModalVisible(false)}
            >
              <Text style={styles.policyModalButtonText}>Okay</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closeRescheduleModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.rescheduleModalOverlay} onPress={closeRescheduleModal}>
            <Pressable style={styles.rescheduleModalCard} onPress={() => {}}>
              <View style={styles.rescheduleModalIcon}>
                <Text style={styles.rescheduleModalIconText}>R</Text>
              </View>
              <Text style={styles.rescheduleModalTitle}>Reason for Rescheduling</Text>
              {rescheduleModal.appointment && (
                <Text style={styles.rescheduleModalSub}>
                  {rescheduleModal.appointment.service_name} -{' '}
                  {formatRelativeDate(rescheduleModal.appointment.start_time)} -{' '}
                  {formatTimeOnly(rescheduleModal.appointment.start_time)}
                </Text>
              )}
              <TextInput
                style={[
                  styles.rescheduleReasonInput,
                  rescheduleModal.error && styles.rescheduleReasonInputError,
                ]}
                placeholder="Tell us why you need to reschedule"
                placeholderTextColor="#9a8a66"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={rescheduleModal.reason}
                onChangeText={(text) =>
                  setRescheduleModal((prev) => ({
                    ...prev,
                    reason: text,
                    error: text.trim() ? '' : prev.error,
                  }))
                }
                maxLength={500}
              />
              {rescheduleModal.error ? (
                <Text style={styles.rescheduleErrorText}>{rescheduleModal.error}</Text>
              ) : null}
              <View style={styles.rescheduleModalActions}>
                <TouchableOpacity
                  style={styles.rescheduleCancelButton}
                  onPress={closeRescheduleModal}
                >
                  <Text style={styles.rescheduleCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduleContinueButton}
                  onPress={handleContinueReschedule}
                >
                  <Text style={styles.rescheduleContinueButtonText}>Choose Slot</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        visible={cancelModal.visible}
        transparent
        animationType="slide"
        onRequestClose={closeCancelModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeCancelModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Cancel appointment</Text>
            {cancelModal.appointment && (
              <Text style={styles.modalSub}>
                {cancelModal.appointment.service_name} ·{' '}
                {formatRelativeDate(cancelModal.appointment.start_time)} ·{' '}
                {formatTimeOnly(cancelModal.appointment.start_time)}
              </Text>
            )}
            {CANCEL_REASONS.map((r) => (
              <TouchableOpacity
                key={r.key}
                style={[styles.reasonOption, selectedReason === r.key && styles.reasonOptionSelected]}
                onPress={() => setSelectedReason(r.key)}
              >
                <View style={[styles.reasonRadio, selectedReason === r.key && styles.reasonRadioChecked]}>
                  {selectedReason === r.key && <View style={styles.reasonRadioDot} />}
                </View>
                <Text style={[styles.reasonText, selectedReason === r.key && styles.reasonTextSelected]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalKeep} onPress={closeCancelModal}>
                <Text style={styles.modalKeepText}>Keep it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !selectedReason && styles.modalConfirmDisabled]}
                onPress={handleConfirmCancel}
                disabled={!selectedReason || cancelling}
              >
                <Text style={styles.modalConfirmText}>
                  {cancelling ? 'Cancelling...' : 'Confirm cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {/* Rating / Feedback Modal */}
      <Modal
        visible={ratingModal.visible}
        transparent
        animationType="slide"
        onRequestClose={closeRatingModal}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
        >
          <Pressable style={styles.modalOverlay} onPress={closeRatingModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />

            {ratingModal.step === 'loading' && (
              <View style={styles.ratingLoadingBox}>
                <ActivityIndicator color="#c98904" size="small" />
                <Text style={styles.ratingLoadingText}>Loading...</Text>
              </View>
            )}

            {ratingModal.step === 'choose' && (
              <>
                <Text style={styles.modalTitle}>Satisfaction Rating</Text>
                {ratingModal.appointment && (
                  <Text style={styles.modalSub}>
                    {ratingModal.appointment.service_name} ·{' '}
                    {formatRelativeDate(ratingModal.appointment.start_time)}
                  </Text>
                )}
                <Text style={styles.ratingChooseNote}>
                  You already submitted a rating for this appointment.
                </Text>
                <TouchableOpacity
                  style={styles.ratingChooseBtn}
                  onPress={() => setRatingModal((prev) => ({ ...prev, step: 'view' }))}
                >
                  <Text style={styles.ratingChooseBtnText}>View my rating</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.ratingChooseBtn, styles.ratingChooseBtnOutline]}
                  onPress={() => {
                    setRatingValue(ratingModal.existingFeedback?.rating ?? 0);
                    setFeedbackText(ratingModal.existingFeedback?.feedback ?? '');
                    setRatingModal((prev) => ({ ...prev, step: 'rate' }));
                  }}
                >
                  <Text style={styles.ratingChooseBtnOutlineText}>Submit a new rating</Text>
                </TouchableOpacity>
              </>
            )}

            {ratingModal.step === 'view' && ratingModal.existingFeedback && (
              <>
                <Text style={styles.modalTitle}>Your Rating</Text>
                {ratingModal.appointment && (
                  <Text style={styles.modalSub}>
                    {ratingModal.appointment.service_name} ·{' '}
                    {formatRelativeDate(ratingModal.appointment.start_time)}
                  </Text>
                )}
                <View style={styles.ratingStarRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                      key={star}
                      style={[
                        styles.ratingStar,
                        star <= ratingModal.existingFeedback.rating && styles.ratingStarFilled,
                      ]}
                    >
                      ★
                    </Text>
                  ))}
                  <Text style={styles.ratingLabelText}>
                    {RATING_LABELS[ratingModal.existingFeedback.rating]}
                  </Text>
                </View>
                {ratingModal.existingFeedback.feedback ? (
                  <View style={styles.ratingViewFeedbackBox}>
                    <Text style={styles.ratingViewFeedbackText}>
                      {ratingModal.existingFeedback.feedback}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.ratingNoFeedbackText}>This patient did not submit a feedback.</Text>
                )}
                <TouchableOpacity style={styles.modalKeep} onPress={closeRatingModal}>
                  <Text style={styles.modalKeepText}>Close</Text>
                </TouchableOpacity>
              </>
            )}

            {ratingModal.step === 'rate' && (
              <>
                <Text style={styles.modalTitle}>Rate your experience</Text>
                {ratingModal.appointment && (
                  <Text style={styles.modalSub}>
                    {ratingModal.appointment.service_name} ·{' '}
                    {formatRelativeDate(ratingModal.appointment.start_time)}
                  </Text>
                )}
                <View style={styles.ratingStarRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                      <Text
                        style={[
                          styles.ratingStar,
                          star <= ratingValue && styles.ratingStarFilled,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {ratingValue > 0 && (
                  <Text style={styles.ratingLabelBelow}>{RATING_LABELS[ratingValue]}</Text>
                )}
                <TextInput
                  style={styles.ratingFeedbackInput}
                  placeholder="Additional feedback (optional)"
                  placeholderTextColor="#aaaaaa"
                  multiline
                  numberOfLines={3}
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  maxLength={500}
                />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalKeep} onPress={closeRatingModal}>
                    <Text style={styles.modalKeepText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirm, styles.ratingSubmitBtn, !ratingValue && styles.modalConfirmDisabled]}
                    onPress={handleSubmitRating}
                    disabled={!ratingValue || ratingSubmitting}
                  >
                    <Text style={styles.modalConfirmText}>
                      {ratingSubmitting ? 'Submitting...' : 'Submit'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {ratingModal.step === 'success' && (
              <View style={styles.ratingSuccessBox}>
                <Text style={styles.ratingSuccessIcon}>✓</Text>
                <Text style={styles.ratingSuccessTitle}>Thank you!</Text>
                <Text style={styles.ratingSuccessText}>Your feedback has been submitted.</Text>
              </View>
            )}
          </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

function getPaymentTracker(appointment) {
  if (appointment.status !== 'completed') {
    return {
      status: 'waiting',
      title: 'Payment available after completion',
      detail: 'The clinic will record the payment method after your visit.',
    };
  }

  if (!appointment.payment_id) {
    return {
      status: 'waiting',
      title: 'Payment not recorded yet',
      detail: 'Please wait for the receptionist to record your payment method.',
    };
  }

  const amount = formatPeso(appointment.payment_amount ?? appointment.service_price);
  const method = formatPaymentMethod(appointment.payment_method);

  if (appointment.payment_status === 'verified') {
    const verifiedAt = appointment.verified_at
      ? ` on ${formatDateTime(appointment.verified_at)}`
      : '';

    return {
      status: 'verified',
      title: 'Receipt acknowledged',
      detail: `${amount} via ${method}${verifiedAt}`,
    };
  }

  if (appointment.payment_status === 'rejected') {
    return {
      status: 'rejected',
      title: 'Receipt rejected',
      detail: appointment.rejection_reason || 'Please contact the clinic for the next step.',
    };
  }

  if (['ewallet', 'bank_transfer'].includes(appointment.payment_method)) {
    if (appointment.receipt_url) {
      const uploadedAt = appointment.receipt_uploaded_at
        ? ` Uploaded ${formatDateTime(appointment.receipt_uploaded_at)}.`
        : '';

      return {
        status: 'pending',
        title: 'Receipt uploaded waiting for acknowledgement',
        detail: `${amount} via ${method}.${uploadedAt}`,
      };
    }

    return {
      status: 'waiting',
      title: 'No receipt uploaded yet',
      detail: `${amount} via ${method}. Upload your payment receipt for acknowledgement.`,
    };
  }

  return {
    status: 'verified',
    title: 'Payment recorded',
    detail: `${amount} via ${method}`,
  };
}

function formatPaymentMethod(method) {
  if (method === 'ewallet') return 'E-wallet';
  if (method === 'bank_transfer') return 'Bank transfer';
  if (method === 'cash') return 'Cash';
  return 'payment';
}

function formatPeso(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toFixed(2)}`;
}

function validateReceiptAsset(asset) {
  const mimeType = String(asset.mimeType || '').toLowerCase();
  const fileName = String(asset.fileName || '').toLowerCase();
  const hasImageExtension = fileName.match(/\.(jpg|jpeg|png|webp|heic|heif)$/);

  if (mimeType && !mimeType.startsWith('image/')) {
    return 'Please choose an image file only. Videos are not allowed.';
  }

  if (fileName.match(/\.(mp4|mov|avi|mkv|webm)$/)) {
    return 'Please choose an image file only. Videos are not allowed.';
  }

  if (!mimeType && fileName && !hasImageExtension) {
    return 'Please choose a JPG, PNG, WEBP, HEIC, or HEIF image.';
  }

  if (asset.fileSize && asset.fileSize > MAX_RECEIPT_SIZE_BYTES) {
    return 'Receipt image is too large. Please upload an image up to 5 MB.';
  }

  return '';
}

function normalizeReceiptAsset(asset, appointmentId) {
  const mimeType = String(asset?.mimeType || 'image/jpeg').toLowerCase();
  const extension = getImageExtension(mimeType, asset?.fileName);

  return {
    ...asset,
    mimeType,
    fileName: asset?.fileName || `receipt-${appointmentId}.${extension}`,
  };
}

function getImageExtension(mimeType, fileName) {
  const fileExtension = String(fileName || '')
    .toLowerCase()
    .match(/\.(jpg|jpeg|png|webp|heic|heif)$/)?.[1];

  if (fileExtension) {
    return fileExtension;
  }

  const mimeExtensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };

  return mimeExtensions[mimeType] || 'jpg';
}

async function uploadReceiptToCloudinary(asset, signature) {
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.mimeType || 'image/jpeg',
    name: asset.fileName || 'payment-receipt.jpg',
  });
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('folder', signature.folder);
  formData.append('signature', signature.signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed.');
  }

  return data;
}
