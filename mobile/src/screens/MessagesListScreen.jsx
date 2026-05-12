import { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { listThreads, listReceptionContacts } from '../api/messages';
import styles from '../styles/MessagesListScreen';

export default function MessagesListScreen({ navigation }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, [])
  );

  async function fetchThreads() {
    try {
      const data = await listThreads();
      setThreads(data);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function openContactPicker() {
    try {
      const list = await listReceptionContacts();
      setContacts(list);
      setContactsOpen(true);
    } catch (err) {
      // silent
    }
  }

  function pickContact(c) {
    setContactsOpen(false);
    navigation.navigate('MessageThread', {
      otherUserId: c.id,
      otherUserName: c.name,
      otherUserRole: c.role,
    });
  }

  function initials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function previewTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <TouchableOpacity onPress={openContactPicker}>
          <Text style={styles.newBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : threads.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No conversations yet.{'\n'}Start one to talk with the clinic.
          </Text>
          <TouchableOpacity onPress={openContactPicker} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchThreads(); }}
            />
          }
        >
          {threads.map(t => (
            <TouchableOpacity
              key={t.other_user_id}
              style={styles.threadRow}
              onPress={() => navigation.navigate('MessageThread', {
                otherUserId: t.other_user_id,
                otherUserName: t.other_user_name,
                otherUserRole: t.other_user_role,
              })}
            >
              <View style={styles.threadInitial}>
                <Text style={styles.threadInitialText}>{initials(t.other_user_name)}</Text>
              </View>
              <View style={styles.threadInfo}>
                <View style={styles.threadTopRow}>
                  <Text style={styles.threadName}>{t.other_user_name}</Text>
                  <Text style={styles.threadTime}>{previewTime(t.last_message_at)}</Text>
                </View>
                <View style={styles.threadBottomRow}>
                  <Text style={styles.threadPreview} numberOfLines={1}>
                    {t.last_message_body}
                  </Text>
                  {t.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{t.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {contactsOpen && (
        <View style={styles.contactPickerOverlay}>
          <View style={styles.contactPicker}>
            <Text style={styles.contactPickerTitle}>Start a conversation</Text>
            <Text style={styles.contactPickerSubtitle}>Pick who you want to message.</Text>
            <FlatList
              data={contacts}
              keyExtractor={c => `${c.id}-${c.branch_id || 'x'}`}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => pickContact(item)} style={styles.contactRow}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactMeta}>
                    {item.role}{item.branch_name ? ` · ${item.branch_name}` : ''}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setContactsOpen(false)} style={styles.contactCloseBtn}>
              <Text style={styles.contactCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}