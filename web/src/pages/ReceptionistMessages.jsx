import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { listThreads, getThread, sendMessage, markThreadRead } from '../api/messages';
import { formatTimeOnly, formatDateOnly } from '../utils/datetime';
import styles from '../styles/ReceptionistMessages';

const POLL_INTERVAL_MS = 8000;

export default function ReceptionistMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [composer, setComposer] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      fetchThreads();
      if (selected) fetchMessages(selected.other_user_id, true);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selected?.other_user_id]);

  useEffect(() => {
    if (selected) fetchMessages(selected.other_user_id);
  }, [selected?.other_user_id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function fetchThreads() {
    try {
      const data = await listThreads();
      setThreads(data);
    } catch (err) {
      // silent — empty state handles it
    }
  }

  async function fetchMessages(otherUserId, silent = false) {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await getThread(otherUserId);
      setMessages(data);
      if (data.some(m => m.receiver_id === user.id && !m.is_read)) {
        markThreadRead(otherUserId).then(fetchThreads).catch(() => {});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }

  async function handleSend() {
    if (!composer.trim() || !selected) return;
    setSending(true);
    setError('');
    try {
      await sendMessage({ receiver_id: selected.other_user_id, content: composer.trim() });
      setComposer('');
      await fetchMessages(selected.other_user_id);
      await fetchThreads();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
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
      return formatTimeOnly(iso);
    }
    return formatDateOnly(iso);
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageTitle}>Messages</div>
      <div style={styles.pageSubtitle}>Conversations with patients at your branch.</div>

      <div style={styles.layout}>
        <div style={styles.threadList}>
          {threads.length === 0 && (
            <div style={styles.empty}>No conversations yet.</div>
          )}
          {threads.map(t => {
            const isActive = selected?.other_user_id === t.other_user_id;
            return (
              <div
                key={t.other_user_id}
                style={{ ...styles.threadRow, ...(isActive ? styles.threadRowActive : {}) }}
                onClick={() => setSelected(t)}
              >
                <div style={styles.threadInitial}>{initials(t.other_user_name)}</div>
                <div style={styles.threadBody}>
                  <div style={styles.threadName}>{t.other_user_name}</div>
                  <div style={styles.threadPreview}>
                    {t.last_message_from === user.id ? 'You: ' : ''}
                    {t.last_message_body}
                  </div>
                </div>
                <div style={styles.threadMeta}>
                  <div style={styles.threadTime}>{previewTime(t.last_message_at)}</div>
                  {t.unread_count > 0 && (
                    <div style={styles.unreadBadge}>{t.unread_count}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.chatPane}>
          {!selected ? (
            <div style={styles.emptyState}>Pick a conversation on the left.</div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.threadInitial}>{initials(selected.other_user_name)}</div>
                <div>
                  <div style={styles.chatHeaderName}>{selected.other_user_name}</div>
                  <div style={styles.chatHeaderMeta}>{selected.other_user_role}</div>
                </div>
              </div>

              <div style={styles.chatMessages}>
                {loadingMessages && messages.length === 0 ? (
                  <div style={styles.loading}>Loading...</div>
                ) : messages.length === 0 ? (
                  <div style={styles.empty}>No messages yet. Say hello.</div>
                ) : (
                  messages.map(m => {
                    const isSelf = m.sender_id === user.id;
                    return (
                      <div
                        key={m.id}
                        style={{ ...styles.bubble, ...(isSelf ? styles.bubbleSelf : styles.bubbleOther) }}
                      >
                        <div>{m.content}</div>
                        <div style={styles.bubbleTime}>{formatTimeOnly(m.created_at)}</div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <div style={styles.composer}>
                <textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder="Type a message..."
                  style={styles.composerInput}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !composer.trim()}
                  style={{
                    ...styles.sendBtn,
                    ...(sending || !composer.trim() ? styles.sendBtnDisabled : {}),
                  }}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}