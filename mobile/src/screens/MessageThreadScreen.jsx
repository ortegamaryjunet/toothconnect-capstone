import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import {
  getPresence,
  getThread,
  sendMessage,
  markThreadRead,
  sendPresenceHeartbeat,
} from '../api/messages';
import { formatErrorText } from '../utils/errors';
import styles from '../styles/MessageThreadScreen';

const POLL_INTERVAL_MS = 5000;

export default function MessageThreadScreen({ navigation, route }) {
  const { otherUserId, otherUserName, otherUserRole } = route.params;
  const { user } = useAuth();

  const displayLocation = formatBranchTitle(otherUserName);

  const [messages, setMessages] = useState([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [presence, setPresence] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    sendPresenceHeartbeat().catch(() => {});
    fetchPresence(true);

    const interval = setInterval(() => {
      sendPresenceHeartbeat().catch(() => {});
      fetchMessages(true);
      fetchPresence(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  async function fetchPresence(silent = false) {
    try {
      const data = await getPresence(otherUserId);
      setPresence(data);
    } catch (err) {
      if (!silent) {
        setError(formatErrorText(err.response?.data?.message || 'Failed to load status.'));
      }

      setPresence(null);
    }
  }

  async function fetchMessages(silent = false) {
    if (!silent) {
      setLoading(true);
    }

    try {
      const data = await getThread(otherUserId);

      setMessages(Array.isArray(data) ? data : []);

      if (
        Array.isArray(data) &&
        data.some(
          m => m.receiver_id === user.id && !m.is_read
        )
      ) {
        markThreadRead(otherUserId)
          .then(() => {
            setMessages(prev =>
              prev.map(m =>
                m.receiver_id === user.id
                  ? { ...m, is_read: true }
                  : m
              )
            );
          })
          .catch(() => {});
      }
    } catch (err) {
      setError(formatErrorText(err.response?.data?.message || 'Failed to load messages.'));
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    setError('');

    try {
      await fetchMessages(true);
      await fetchPresence(true);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSend() {
    const messageText = composer.trim();

    if (!messageText || sending) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await sendMessage({
        receiver_id: otherUserId,
        content: messageText,
      });

      if (!response) {
        throw new Error('Failed to send message');
      }

      if (
        response.success === false ||
        response.status === 'failed' ||
        response.status === 'error'
      ) {
        throw new Error(
          response.message || 'Failed to send message'
        );
      }

      setComposer('');

      await fetchMessages(true);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    } catch (err) {
      setError(formatErrorText(err.response?.data?.message || err.message || 'Failed to send message.'));
    } finally {
      setSending(false);
    }
  }

  function formatBubbleTime(iso) {
    if (!iso) return '';

    const d = new Date(iso);

    if (Number.isNaN(d.getTime())) {
      return '';
    }

    return d.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function initials(name) {
    if (!name) return '?';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  }

  function displayRole() {
    return presence?.is_online ? 'Online' : 'Offline';
  }

  function getSelfMessageStatus(message) {
    return message.is_read ? 'Read' : 'Delivered';
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {initials(displayLocation)}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text
            style={styles.headerName}
            numberOfLines={1}
          >
            {displayLocation}
          </Text>

          <View style={styles.onlineRow}>
            <Text
              style={[
                styles.headerRole,
                !presence?.is_online &&
                  styles.headerRoleOffline,
              ]}
            >
              {displayRole()}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#c98b00"
              colors={['#c98b00']}
            />
          }
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({
              animated: false,
            })
          }
        >
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>
              Today
            </Text>
          </View>

          {loading ? (
            <Text style={styles.loading}>
              Loading...
            </Text>
          ) : messages.length === 0 ? (
            <Text style={styles.empty}>
              No messages yet. Say hello.
            </Text>
          ) : (
            messages.map(m => {
              const isSelf = m.sender_id === user.id;

              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBlock,
                    isSelf
                      ? styles.messageBlockSelf
                      : styles.messageBlockOther,
                  ]}
                >
                  <View
                    style={[
                      styles.bubble,
                      isSelf
                        ? styles.bubbleSelf
                        : styles.bubbleOther,
                    ]}
                  >
                    <Text
                      style={
                        isSelf
                          ? styles.bubbleTextSelf
                          : styles.bubbleTextOther
                      }
                    >
                      {m.content}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.bubbleTime,
                      isSelf
                        ? styles.bubbleTimeSelf
                        : styles.bubbleTimeOther,
                    ]}
                  >
                    {formatBubbleTime(m.created_at)}
                    {isSelf
                      ? ` • ${getSelfMessageStatus(m)}`
                      : ''}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={composer}
            onChangeText={setComposer}
            placeholder="Type your message"
            placeholderTextColor="#8f8f8f"
            multiline
            editable={!sending}
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (sending || !composer.trim()) &&
                styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={sending || !composer.trim()}
          >
            <Text style={styles.sendBtnText}>
              {sending ? '...' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatBranchTitle(name) {
  const branchName = String(name || 'Clinic').trim();

  return /\bbranch\b/i.test(branchName) ? branchName : `${branchName} Branch`;
}
