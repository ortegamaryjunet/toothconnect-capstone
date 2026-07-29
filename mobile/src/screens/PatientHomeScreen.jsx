import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { listAppointments, cancelAppointment } from '../api/appointments';
import { formatRelativeDate, formatTimeOnly } from '../utils/datetime';
import { isCancellationLocked } from '../utils/appointments';
import styles from '../styles/PatientHomeScreen';
import { getUnreadCount } from '../api/notifications';

export default function PatientHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
      fetchUnreadCount();
    }, [])
  );

  async function fetchAppointments() {
    try {
      const data = await listAppointments();
      setAppointments(data);
    } catch (err) {
      // Silent — patient might just have no appointments yet
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function fetchUnreadCount() {
  try {
    const count = await getUnreadCount();
    setUnreadCount(count);
  } catch {}
}

  function onRefresh() {
    setRefreshing(true);
    fetchAppointments();
  }

  function confirmLogout() {
    Alert.alert(
      'Logout?',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  }

  async function handleCancel(appointment) {
    if (isCancellationLocked(appointment)) {
      Alert.alert(
        'Cancellation locked',
        'Appointments can no longer be cancelled within 24 hours of the scheduled time.'
      );
      return;
    }

    Alert.alert(
      'Cancel appointment?',
      `${appointment.service_name} on ${formatRelativeDate(appointment.start_time)} at ${formatTimeOnly(appointment.start_time)}`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel appointment',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              fetchAppointments();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to cancel');
            }
          },
        },
      ]
    );
  }

  const now = new Date();
  const upcoming = appointments.filter(
    a => a.status === 'scheduled' && new Date(a.start_time) >= now
  );
  const past = appointments.filter(
    a => a.status !== 'scheduled' || new Date(a.start_time) < now
  ).slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>ToothConnect</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View style={{ position: 'relative' }}>
              <Text style={{ fontSize: 22, color: '#fff' }}>🔔</Text>
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: -8,
                  backgroundColor: '#e53e3e',
                  borderRadius: 999,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  minWidth: 18,
                  alignItems: 'center',
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmLogout}>
            <Text style={styles.logout}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.welcome}>Hi, {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.bookCard}
          onPress={() => navigation.navigate('BookService')}
        >
          <View style={styles.bookCardLeft}>
            <Text style={styles.bookCardTitle}>Book an appointment</Text>
            <Text style={styles.bookCardSubtitle}>AI-suggested slots based on your history</Text>
          </View>
          <Text style={styles.bookCardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('TreatmentProgress')}
        >
          <View style={styles.bookCardLeft}>
            <Text style={styles.featureCardTitle}>Treatment progress</Text>
            <Text style={styles.featureCardSubtitle}>View your treatments per tooth</Text>
          </View>
          <Text style={styles.featureCardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.featureCard}
          onPress={() => navigation.navigate('MessagesList')}
        >
          <View style={styles.bookCardLeft}>
            <Text style={styles.featureCardTitle}>Messages</Text>
            <Text style={styles.featureCardSubtitle}>Chat with the clinic reception</Text>
          </View>
          <Text style={styles.featureCardArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Upcoming</Text>
        {loading ? (
          <Text style={styles.apptsLoading}>Loading...</Text>
        ) : upcoming.length === 0 ? (
          <View style={styles.emptyAppts}>
            <Text style={styles.emptyApptsText}>No upcoming appointments.{'\n'}Tap "Book" above to schedule one.</Text>
          </View>
        ) : (
          upcoming.map(a => {
            const cancellationLocked = isCancellationLocked(a);

            return (
            <View key={a.id} style={styles.apptCard}>
              <View style={styles.apptTopRow}>
                <Text style={styles.apptDateTime}>
                  {formatRelativeDate(a.start_time)} · {formatTimeOnly(a.start_time)}
                </Text>
                <Text style={[styles.apptStatus, statusBadgeStyle(a.status)]}>{a.status}</Text>
              </View>
              <Text style={styles.apptDetails}>
                {a.service_name} with {a.dentist_name}
              </Text>
              <Text style={styles.apptBranch}>{a.branch_name}</Text>
              <TouchableOpacity
                onPress={() => handleCancel(a)}
                style={[
                  styles.apptCancelLink,
                  cancellationLocked && styles.apptCancelLinkDisabled,
                ]}
                disabled={cancellationLocked}
              >
                <Text
                  style={[
                    styles.apptCancelLinkText,
                    cancellationLocked && styles.apptCancelLinkTextDisabled,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            );
          })
        )}

        {past.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent</Text>
            {past.map(a => (
              <View key={a.id} style={styles.apptCard}>
                <View style={styles.apptTopRow}>
                  <Text style={styles.apptDateTime}>
                    {formatRelativeDate(a.start_time)} · {formatTimeOnly(a.start_time)}
                  </Text>
                  <Text style={[styles.apptStatus, statusBadgeStyle(a.status)]}>{a.status}</Text>
                </View>
                <Text style={styles.apptDetails}>
                  {a.service_name} with {a.dentist_name}
                </Text>
                <Text style={styles.apptBranch}>{a.branch_name}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function statusBadgeStyle(status) {
  const colors = {
    scheduled: { backgroundColor: '#bee3f8', color: '#2c5282' },
    completed: { backgroundColor: '#c6f6d5', color: '#276749' },
    cancelled: { backgroundColor: '#fed7d7', color: '#9b2c2c' },
    no_show: { backgroundColor: '#feebc8', color: '#9c4221' },
  };
  return colors[status] || { backgroundColor: '#e2e8f0', color: '#4a5568' };
}
