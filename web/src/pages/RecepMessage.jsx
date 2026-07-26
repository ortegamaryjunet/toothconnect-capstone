import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import {
  getThread,
  listThreads,
  markThreadRead,
  getPresence,
  sendMessage as sendThreadMessage,
  sendPresenceHeartbeat,
} from '../api/messages';
import { listPatients } from '../api/patients';
import createRecepMessageStyles from '../styles/RecepMessage';
import { formatTimeOnly } from '../utils/datetime';

const POLL_INTERVAL_MS = 7000;

export default function RecepMessage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [patients, setPatients] = useState([]);
  const [selectedPatientOption, setSelectedPatientOption] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);

  const isMobile = screenWidth <= 768;
  const isVerySmall = screenWidth <= 560;
  const isSmallScreen = screenWidth <= 1200;
  const isTablet = screenWidth <= 992;

  const styles = createRecepMessageStyles({
    isMobile,
    isVerySmall,
    isSmallScreen,
    isTablet,
  });

  const selectedChat = chats.find(
    (chat) => String(chat.id) === String(selectedChatId)
  );

  const filteredChats = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();

    return chats.filter((chat) => {
      const matchesSearch = chat.name.toLowerCase().includes(searchValue);
      const matchesFilter = activeFilter === 'all' || chat.unread > 0;

      return matchesSearch && matchesFilter;
    });
  }, [chats, searchText, activeFilter]);

  const patientOptions = useMemo(() => {
    return patients
      .map(mapPatientOption)
      .filter((patient) => patient.id && patient.name)
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [patients]);

  const noResultText =
    activeFilter === 'unread' ? 'No unread messages' : 'No patient found';

  useEffect(() => {
    function handleResize() {
      setScreenWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const originalBodyMargin = document.body.style.margin;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.margin = '0';
    document.body.style.overflow = isMobile ? 'auto' : 'hidden';
    document.documentElement.style.overflow = isMobile ? 'auto' : 'hidden';

    return () => {
      document.body.style.margin = originalBodyMargin;
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isMobile]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatId, selectedChat?.messages?.length]);

  useEffect(() => {
    fetchPatients();
    fetchChats();
    sendPresenceHeartbeat().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      fetchPresence(selectedChatId, true);
    }

    const interval = setInterval(() => {
      fetchChats(true);
      sendPresenceHeartbeat().catch(() => {});

      if (selectedChatId) {
        fetchThreadMessages(selectedChatId, true);
        fetchPresence(selectedChatId, true);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // The polling effect intentionally follows the selected conversation only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  async function fetchPatients() {
    setIsLoadingPatients(true);

    try {
      const data = await listPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch {
      setPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  }

  async function fetchPresence(userId, silent = false) {
    if (!userId) {
      setSelectedPresence(null);
      return;
    }

    try {
      const presence = await getPresence(userId);
      setSelectedPresence(presence);
    } catch (err) {
      if (!silent) {
        setMessageError(err.response?.data?.message || 'Failed to load status.');
      }
      setSelectedPresence(null);
    }
  }

  async function fetchChats(silent = false) {
    if (!silent) {
      setIsLoadingChats(true);
    }

    try {
      const threads = await listThreads();
      setChats((currentChats) =>
        mergeChatsWithThreads(currentChats, Array.isArray(threads) ? threads : [])
      );
    } catch (err) {
      if (!silent) {
        setMessageError(
          err.response?.data?.message || 'Failed to load conversations.'
        );
      }
    } finally {
      if (!silent) {
        setIsLoadingChats(false);
      }
    }
  }

  async function fetchThreadMessages(patientId, silent = false) {
    if (!patientId) {
      return;
    }

    if (!silent) {
      setMessageError('');
    }

    try {
      const data = await getThread(patientId);
      const normalizedMessages = normalizeMessages(data, user?.id);

      setChats((currentChats) =>
        currentChats.map((chat) =>
          String(chat.id) === String(patientId)
            ? {
                ...chat,
                unread: 0,
                lastTime:
                  normalizedMessages[normalizedMessages.length - 1]?.time ||
                  chat.lastTime,
                messages: normalizedMessages,
              }
            : chat
        )
      );

      if (
        Array.isArray(data) &&
        data.some((message) => message.receiver_id === user?.id && !message.is_read)
      ) {
        markThreadRead(patientId).then(() => fetchChats(true)).catch(() => {});
      }
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Failed to load messages.');
    }
  }

  function selectChat(chatId) {
    setSelectedChatId(chatId);
    setSelectedPatientOption('');

    setChats((currentChats) =>
      currentChats.map((chat) =>
        String(chat.id) === String(chatId) ? { ...chat, unread: 0 } : chat
      )
    );

    fetchThreadMessages(chatId);
    fetchPresence(chatId);
  }

  function closeCurrentThread() {
    setSelectedChatId('');
    setMessageText('');
    setMessageError('');
    setSelectedPatientOption('');
    setSelectedPresence(null);
  }

  async function sendMessage() {
    const text = messageText.trim();

    if (!selectedChatId || text === '' || isSendingMessage) {
      return;
    }

    const time = getCurrentTime();

    setChats((currentChats) =>
      currentChats.map((chat) =>
        String(chat.id) === String(selectedChatId)
          ? {
              ...chat,
              lastTime: time,
              messages: [
                ...chat.messages,
                {
                  text,
                  type: 'sent',
                  time,
                  status: 'Delivered',
                },
              ],
            }
          : chat
      )
    );

    setMessageText('');
    setIsSendingMessage(true);
    setMessageError('');

    try {
      await sendThreadMessage({
        receiver_id: Number(selectedChatId),
        content: text,
      });
      await fetchThreadMessages(selectedChatId, true);
      await fetchChats(true);
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  }

  function handleMessageKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  }

  function handlePatientDropdownChange(event) {
    const patientId = event.target.value;
    setSelectedPatientOption(patientId);

    if (!patientId) {
      return;
    }

    const existingChat = chats.find(
      (chat) => String(chat.id) === String(patientId)
    );

    if (existingChat) {
      selectChat(patientId);
      return;
    }

    const patient = patientOptions.find(
      (option) => String(option.id) === String(patientId)
    );

    if (!patient) {
      return;
    }

    const newChat = {
      id: patient.id,
      name: patient.name,
      unread: 0,
      lastTime: 'New',
      messages: [],
    };

    setChats((currentChats) => [newChat, ...currentChats]);
    selectChat(newChat.id);
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  function openBackConfirmModal() {
    setShowBackConfirmModal(true);
  }

  function closeBackConfirmModal() {
    setShowBackConfirmModal(false);
  }

  function handleBackConfirm() {
    navigate(-1);
  }

  function handleBackModalOverlayClick(event) {
    if (event.target === event.currentTarget) {
      closeBackConfirmModal();
    }
  }

  return (
    <div style={styles.chatContainer}>
      <aside style={styles.chatSidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.backBtn}>
            <button
              type="button"
              style={styles.backLink}
              onClick={openBackConfirmModal}
            >
              Back
            </button>
          </div>

          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarHeaderContent}>
              <h2 style={styles.sidebarTitle}>Patient Messages</h2>
              <p style={styles.sidebarSubtitle}>
                View and reply to patient inquiries.
              </p>
              <div style={styles.newChatSelectWrap}>
                <i
                  className="fi fi-rr-comment-medical"
                  style={styles.newChatSelectIcon}
                ></i>
                <select
                  value={selectedPatientOption}
                  onChange={handlePatientDropdownChange}
                  disabled={isLoadingPatients || patientOptions.length === 0}
                  style={styles.newChatSelect}
                  title="Start new conversation"
                >
                  <option value="">
                    {isLoadingPatients
                      ? 'Loading patients...'
                      : patientOptions.length === 0
                        ? 'No patients'
                        : 'Start chat'}
                  </option>

                  {patientOptions.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={styles.searchBox}>
            <i className="fi fi-rr-search" style={styles.searchIcon}></i>

            <input
              type="text"
              placeholder="Search patient"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.filterButtons}>
            <button
              type="button"
              style={{
                ...styles.filterBtn,
                ...(activeFilter === 'all' ? styles.filterBtnActive : {}),
              }}
              onClick={() => {
                setActiveFilter('all');
                setSearchText('');
              }}
            >
              All
            </button>

            <button
              type="button"
              style={{
                ...styles.filterBtn,
                ...(activeFilter === 'unread' ? styles.filterBtnActive : {}),
              }}
              onClick={() => setActiveFilter('unread')}
            >
              Unread
            </button>
          </div>
        </div>

        <div style={styles.chatList}>
          {isLoadingChats ? (
            <div style={styles.noResult}>Loading conversations...</div>
          ) : filteredChats.length === 0 ? (
            <div style={styles.noResult}>{noResultText}</div>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                styles={styles}
                chat={chat}
                isActive={String(chat.id) === String(selectedChatId)}
                onClick={() => selectChat(chat.id)}
              />
            ))
          )}
        </div>
      </aside>

      <main style={styles.chatMain}>
        {!selectedChat && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <i className="fi fi-rr-comment-alt"></i>
            </div>

            <h2 style={styles.emptyTitle}>No conversation selected</h2>
            <p style={styles.emptyText}>
              Select a patient message or choose a patient from the dropdown.
            </p>
          </div>
        )}

        {selectedChat && (
          <div style={styles.conversation}>
            <div style={styles.conversationHeader}>
              <div style={styles.patientProfile}>
                <div style={{ ...styles.avatar, ...styles.avatarLarge }}>
                  {getInitial(selectedChat.name)}
                </div>

                <div>
                  <h3 style={styles.patientName}>{selectedChat.name}</h3>
                  <p
                    style={{
                      ...styles.patientOnline,
                      ...(selectedPresence?.is_online
                        ? {}
                        : styles.patientOffline),
                    }}
                  >
                    {selectedPresence?.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                style={styles.closeThreadBtn}
                title="Close conversation"
                onClick={closeCurrentThread}
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <div style={styles.chatMessages}>
              <div style={styles.dateDivider}>Today</div>

              {selectedChat.messages.length === 0 ? (
                <div style={styles.noResult}>No messages yet</div>
              ) : (
                selectedChat.messages.map((message, index) => {
                  const nextMessage = selectedChat.messages[index + 1];

                  const isGrouped =
                    nextMessage &&
                    nextMessage.type === message.type &&
                    nextMessage.time === message.time;

                  return (
                    <MessageBubble
                      key={`${message.text}-${index}`}
                      styles={styles}
                      message={message}
                      isGrouped={isGrouped}
                    />
                  );
                })
              )}

              <div ref={messagesEndRef}></div>
            </div>

            <div style={styles.messageInputContainer}>
              {messageError && <div style={styles.messageError}>{messageError}</div>}

              <input
                type="text"
                placeholder="Type your message"
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleMessageKeyDown}
                style={styles.messageInput}
              />

              <button
                type="button"
                title="Send Message"
                disabled={isSendingMessage || !messageText.trim()}
                style={{
                  ...styles.sendBtn,
                  ...(isSendingMessage || !messageText.trim()
                    ? styles.sendBtnDisabled
                    : {}),
                }}
                onClick={sendMessage}
              >
                <i className="fi fi-rr-paper-plane"></i>
              </button>
            </div>
          </div>
        )}
      </main>

      {showBackConfirmModal && (
        <div style={styles.modal} onClick={handleBackModalOverlayClick}>
          <div style={styles.backModalContent}>
            <div style={styles.backModalIcon}>
              <i className="fi fi-rr-exclamation" style={styles.modalIconText}></i>
            </div>

            <h2 style={styles.backModalTitle}>Leave Messages</h2>
            <p style={styles.backModalText}>Are you sure you want to go back?</p>

            <div style={styles.backModalActions}>
              <button
                type="button"
                style={{ ...styles.backModalButton, ...styles.backCancelBtn }}
                onClick={closeBackConfirmModal}
              >
                No
              </button>

              <button
                type="button"
                style={{ ...styles.backModalButton, ...styles.backConfirmBtn }}
                onClick={handleBackConfirm}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatItem({ styles, chat, isActive, onClick }) {
  const lastMessage = chat.messages[chat.messages.length - 1];

  return (
    <button
      type="button"
      style={{
        ...styles.chatItem,
        ...(isActive ? styles.chatItemActive : {}),
        ...(chat.unread > 0 ? styles.chatItemUnread : {}),
      }}
      onClick={onClick}
    >
      <div style={styles.avatar}>{getInitial(chat.name)}</div>

      <div style={styles.chatInfo}>
        <div style={styles.chatRow}>
          <div style={styles.chatNameWrap}>
            <h4 style={styles.chatName}>{chat.name}</h4>
          </div>
          <span style={styles.chatTime}>{chat.lastTime}</span>
        </div>

        <div style={styles.chatRow}>
          <p style={styles.chatPreview}>
            {lastMessage ? lastMessage.text : 'No messages yet'}
          </p>

          {chat.unread > 0 && (
            <span style={styles.unreadBadge}>{chat.unread}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ styles, message, isGrouped }) {
  const isSent = message.type === 'sent';

  return (
    <div
      style={{
        ...styles.messageRow,
        ...(isSent ? styles.messageRowSent : styles.messageRowReceived),
      }}
    >
      <div
        style={{
          ...styles.messageBubble,
          ...(isSent ? styles.messageBubbleSent : styles.messageBubbleReceived),
          ...(isSent && !isGrouped ? styles.sentBubbleLast : {}),
          ...(!isSent && !isGrouped ? styles.receivedBubbleLast : {}),
        }}
      >
        {message.text}
      </div>

      {!isGrouped && (
        <span style={isSent ? styles.messageStatus : styles.messageTime}>
          {isSent
            ? `${message.time} • ${message.status || 'Delivered'}`
            : message.time}
        </span>
      )}
    </div>
  );
}

function getInitial(name) {
  return String(name || '?').charAt(0).toUpperCase();
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapPatientOption(patient) {
  return {
    id: patient.id || patient.user_id || patient.patient_id || patient.info_id,
    name:
      patient.full_name ||
      patient.name ||
      [patient.first_name, patient.middle_name, patient.last_name]
        .filter(Boolean)
        .join(' ')
        .trim(),
  };
}

function mergeChatsWithThreads(currentChats, threads) {
  const existingByIdMap = new Map(
    currentChats.map((chat) => [String(chat.id), chat])
  );

  const threadChatIds = new Set();

  // Build list in backend sort order (most recent first).
  const result = threads.map((thread) => {
    const chatId = String(thread.other_user_id);
    threadChatIds.add(chatId);
    const existing = existingByIdMap.get(chatId);

    return {
      id: thread.other_user_id,
      name: thread.other_user_name || 'Patient',
      unread: Number(thread.unread_count || 0),
      lastTime: previewTime(thread.last_message_at),
      messages:
        existing?.messages?.length > 0
          ? existing.messages
          : [
              {
                text: thread.last_message_body || '',
                type: 'received',
                time: previewTime(thread.last_message_at),
                status: '',
              },
            ],
    };
  });

  // Prepend any locally-created draft chats not yet persisted on the backend.
  currentChats.forEach((chat) => {
    if (!threadChatIds.has(String(chat.id))) {
      result.unshift(chat);
    }
  });

  return result;
}

function normalizeMessages(items, currentUserId) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((message) => ({
    id: message.id,
    text: message.content || '',
    type: message.sender_id === currentUserId ? 'sent' : 'received',
    time: formatTimeOnly(message.created_at) || getCurrentTime(),
    status: message.is_read ? 'Read' : 'Delivered',
  }));
}

function previewTime(value) {
  return value ? formatTimeOnly(value) : '';
}
