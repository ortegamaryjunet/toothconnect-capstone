import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { listAppointments, cancelAppointment } from '../api/appointments';
import { formatRelativeDate, formatTimeOnly } from '../utils/datetime';
import styles from '../styles/PatientHomeScreen';

export default function PatientHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
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

  function onRefresh() {
    setRefreshing(true);
    fetchAppointments();
  }

  async function handleCancel(appointment) {
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
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
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
          onPress={() => navigation.navigate('RiskAssessment')}
        >
          <View style={styles.bookCardLeft}>
            <Text style={styles.featureCardTitle}>Dental risk assessment</Text>
            <Text style={styles.featureCardSubtitle}>Self-assess your caries risk and see recommendations</Text>
          </View>
          <Text style={styles.featureCardArrow}>→</Text>
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

        <Text style={styles.sectionTitle}>Upcoming</Text>
        {loading ? (
          <Text style={styles.apptsLoading}>Loading...</Text>
        ) : upcoming.length === 0 ? (
          <View style={styles.emptyAppts}>
            <Text style={styles.emptyApptsText}>No upcoming appointments.{'\n'}Tap "Book" above to schedule one.</Text>
          </View>
        ) : (
          upcoming.map(a => (
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
              <TouchableOpacity onPress={() => handleCancel(a)} style={styles.apptCancelLink}>
                <Text style={styles.apptCancelLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))
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