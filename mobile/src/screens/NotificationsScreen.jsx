import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import styles from '../styles/NotificationsScreen';

const TYPE_LABELS = {
  message: 'Message',
  appointment_reminder: 'Appointment',
  recall: 'Recall',
  system: 'System',
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
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
    if (n.related_type === 'message' && n.related_id) {
      navigation.navigate('MessagesList');
    } else if (n.related_type === 'appointment') {
      navigation.navigate('Home');
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

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
    </SafeAreaView>
  );
}