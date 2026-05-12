import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthContext';
import { getThread, sendMessage, markThreadRead } from '../api/messages';
import styles from '../styles/MessageThreadScreen';

const POLL_INTERVAL_MS = 6000;

export default function MessageThreadScreen({ navigation, route }) {
  const { otherUserId, otherUserName, otherUserRole } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [composer, setComposer] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function fetchMessages(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await getThread(otherUserId);
      setMessages(data);
      if (data.some(m => m.receiver_id === user.id && !m.is_read)) {
        markThreadRead(otherUserId).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handleSend() {
    if (!composer.trim()) return;
    setSending(true);
    setError('');
    try {
      await sendMessage({ receiver_id: otherUserId, content: composer.trim() });
      setComposer('');
      await fetchMessages();
      scrollRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  function formatBubbleTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherUserName}</Text>
          <Text style={styles.headerRole}>{otherUserRole}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {loading ? (
            <Text style={styles.loading}>Loading...</Text>
          ) : messages.length === 0 ? (
            <Text style={styles.empty}>No messages yet. Say hello.</Text>
          ) : (
            messages.map(m => {
              const isSelf = m.sender_id === user.id;
              return (
                <View
                  key={m.id}
                  style={[styles.bubble, isSelf ? styles.bubbleSelf : styles.bubbleOther]}
                >
                  <Text style={isSelf ? styles.bubbleTextSelf : styles.bubbleTextOther}>
                    {m.content}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      isSelf ? styles.bubbleTimeSelf : styles.bubbleTimeOther,
                    ]}
                  >
                    {formatBubbleTime(m.created_at)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.composerInput}
            value={composer}
            onChangeText={setComposer}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (sending || !composer.trim()) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending || !composer.trim()}
          >
            <Text style={styles.sendBtnText}>{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}