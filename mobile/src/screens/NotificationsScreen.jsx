import { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import AppSidebar from '../components/AppSidebar';
import styles from '../styles/NotificationsScreen';

const TYPE_LABELS = {
  message: 'Message',
  appointment_reminder: 'Appointment',
  appointment_cancelled_by_staff: 'Appointment',
  recall: 'Recall',
  system: 'System',
  receipt_upload_enabled: 'Receipt',
  receipt_validated: 'Receipt',
  receipt_rejected: 'Receipt',
};

export default function NotificationsScreen({ navigation }) {
  const sidebarRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [])
  );

  async function fetchAll() {
    try {
      const data = await listNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleTap(n) {
    if (!n.is_read) {
      try { await markNotificationRead(n.id); } catch {}
    }

    const { type, related_id } = n;

    if (type === 'message' || n.related_type === 'message') {
      navigation.navigate('MessagesList');
    } else if (
      type === 'receipt_upload_enabled' ||
      type === 'receipt_validated' ||
      type === 'receipt_rejected'
    ) {
      navigation.navigate('Appointments', { highlightAppointmentId: related_id });
    } else if (type === 'appointment_cancelled_by_staff') {
      navigation.navigate('Appointments', { highlightAppointmentId: related_id });
    } else {
      fetchAll();
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      fetchAll();
    } catch {}
  }

  function formatRelative(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainWrapper}>
        <View style={styles.dashboardArea}>

          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton} onPress={() => sidebarRef.current?.open()}>
              <Text style={styles.menuButtonText}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Notifications</Text>

            {unreadCount > 0 ? (
              <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll}>
                <Text style={styles.markAll}>Mark all read</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerPlaceholder} />
            )}
          </View>

          {unreadCount > 0 && (
            <View style={styles.unreadBar}>
              <Text style={styles.unreadBarText}>{unreadCount} unread</Text>
            </View>
          )}

          <ScrollView
        style={styles.body}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchAll(); }}
          />
        }
      >
        {loading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.empty}>No notifications yet.</Text>
        ) : (
          notifications.map(n => (
            <TouchableOpacity
              key={n.id}
              style={[styles.item, !n.is_read && styles.itemUnread]}
              onPress={() => handleTap(n)}
            >
              <Text style={styles.itemTypeTag}>{TYPE_LABELS[n.type] || n.type}</Text>
              {n.title && <Text style={styles.itemTitle}>{n.title}</Text>}
              <Text style={styles.itemBody}>{n.body}</Text>
              <Text style={styles.itemMeta}>{formatRelative(n.created_at)}</Text>
            </TouchableOpacity>
          ))
        )}
          </ScrollView>

        </View>

        <AppSidebar ref={sidebarRef} navigation={navigation} activeScreen="Notifications" />
      </View>
    </SafeAreaView>
  );
}
