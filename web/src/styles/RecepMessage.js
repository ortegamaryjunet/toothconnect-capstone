const createRecepMessageStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isTablet = false,
} = {}) => {
  return {
    chatContainer: {
      display: 'flex',
      width: '100%',
      height: isMobile ? 'auto' : '100vh',
      minHeight: '100vh',
      flexDirection: isMobile ? 'column' : 'row',
      background: 'linear-gradient(135deg, #eaf3ff 0%, #f8fbff 45%, #eef6ff 100%)',
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      overflow: isMobile ? 'visible' : 'hidden',
      boxSizing: 'border-box',
    },

    chatSidebar: {
      width: isMobile ? '100%' : isTablet ? 300 : isSmallScreen ? 320 : 350,
      height: isMobile ? 'auto' : '100vh',
      maxHeight: isMobile ? '52vh' : 'none',
      background: 'rgba(255, 255, 255, 0.96)',
      borderRight: isMobile ? 'none' : '1px solid #dbeafe',
      borderBottom: isMobile ? '1px solid #dbeafe' : 'none',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      boxShadow: isMobile
        ? '0 10px 25px rgba(15, 23, 42, 0.06)'
        : '8px 0 28px rgba(15, 23, 42, 0.06)',
      zIndex: 2,
    },

    sidebarTop: {
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      background: '#ffffff',
      zIndex: 10,
      borderBottom: '1px solid #eef2ff',
    },

    backBtn: {
      padding: isVerySmall ? '14px 14px 6px' : '18px 20px 8px',
    },

    backLink: {
      width: isVerySmall ? '100%' : 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: isVerySmall ? 'center' : 'flex-start',
      gap: 8,
      textDecoration: 'none',
      color: '#2563eb',
      fontSize: 14,
      fontWeight: 800,
      padding: '10px 15px',
      borderRadius: 999,
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      cursor: 'pointer',
      transition: '0.25s ease',
      fontFamily: 'Arial, sans-serif',
    },

    logo: {
      textAlign: 'center',
      padding: '8px 0 14px',
    },

    logoImg: {
      width: isVerySmall ? 115 : 130,
      height: 'auto',
    },

    sidebarHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: isVerySmall ? '0 14px 14px' : '0 20px 16px',
      gap: 14,
    },

    sidebarHeaderContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8,
    },

    sidebarTitle: {
      fontSize: isVerySmall ? 22 : 26,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      margin: 0,
      marginTop: 10,
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },

    sidebarSubtitle: {
      fontSize: isVerySmall ? 13 : 14,
      color: '#64748b',
      lineHeight: 1.5,
      marginTop: 0,
      marginBottom: 0,
    },

    newChatSelectWrap: {
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      height: 48,
      borderRadius: 16,
      background: '#f8fbff',
      border: '1px solid #bfdbfe',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '0 12px',
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 8px 18px rgba(37, 99, 235, 0.08)',
    },

    newChatSelectIcon: {
      color: '#2563eb',
      fontSize: 17,
      flexShrink: 0,
    },

    newChatSelect: {
      width: '100%',
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#0f172a',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    searchBox: {
      margin: isVerySmall ? '0 14px 12px' : '0 20px 14px',
      padding: '12px 14px',
      borderRadius: 16,
      background: '#f8fbff',
      border: '1px solid #dbeafe',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxSizing: 'border-box',
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)',
    },

    searchIcon: {
      color: '#2563eb',
      fontSize: 17,
    },

    searchInput: {
      width: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 15,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    filterButtons: {
      display: 'flex',
      gap: 8,
      padding: isVerySmall ? '0 14px 14px' : '0 20px 16px',
    },

    filterBtn: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: 999,
      background: '#ffffff',
      color: '#64748b',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 13,
      transition: '0.25s ease',
      fontFamily: 'Arial, sans-serif',
    },

    filterBtnActive: {
      background: '#2563eb',
      borderColor: '#2563eb',
      color: '#ffffff',
      boxShadow: '0 10px 18px rgba(37, 99, 235, 0.22)',
    },

    chatList: {
      flex: 1,
      overflowY: 'auto',
      padding: isVerySmall ? '0 8px 12px' : '0 10px 16px',
      boxSizing: 'border-box',
    },

    chatItem: {
      width: '100%',
      display: 'flex',
      gap: 12,
      padding: '14px 12px',
      borderRadius: 20,
      cursor: 'pointer',
      transition: '0.25s ease',
      marginBottom: 9,
      border: '1px solid transparent',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    chatItemActive: {
      background: '#eff6ff',
      border: '1px solid #bfdbfe',
      boxShadow: '0 10px 22px rgba(37, 99, 235, 0.10)',
    },

    chatItemUnread: {
      background: '#f8fbff',
      border: '1px solid #dbeafe',
    },

    avatar: {
      width: 46,
      height: 46,
      borderRadius: 16,
      background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 17,
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: '0 10px 18px rgba(37, 99, 235, 0.24)',
    },

    avatarLarge: {
      width: 52,
      height: 52,
      borderRadius: 18,
    },

    chatInfo: {
      width: '100%',
      overflow: 'hidden',
      minWidth: 0,
    },

    chatNameWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },

    chatRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },

    chatName: {
      fontSize: 15,
      color: '#0f172a',
      margin: 0,
      fontWeight: 900,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    chatPreview: {
      fontSize: 13,
      color: '#64748b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: isVerySmall ? 150 : isTablet ? 190 : isSmallScreen ? 220 : 260,
      margin: '4px 0 0',
      lineHeight: 1.35,
    },

    chatTime: {
      fontSize: 12,
      color: '#94a3b8',
      flexShrink: 0,
      fontWeight: 700,
    },

    unreadBadge: {
      background: '#ef4444',
      color: '#ffffff',
      fontSize: 11,
      minWidth: 20,
      height: 20,
      borderRadius: 999,
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: '0 6px 14px rgba(239, 68, 68, 0.24)',
    },

    chatMain: {
      flex: 1,
      height: isMobile ? '52vh' : '100vh',
      minHeight: isMobile ? 480 : 'auto',
      background: '#f8fbff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
    },

    emptyState: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      color: '#64748b',
      textAlign: 'center',
      padding: 30,
      boxSizing: 'border-box',
    },

    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 28,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 34,
      boxShadow: '0 12px 24px rgba(37, 99, 235, 0.12)',
    },

    emptyTitle: {
      color: '#0f172a',
      fontSize: isVerySmall ? 23 : 28,
      margin: 0,
      fontWeight: 900,
    },

    emptyText: {
      fontSize: 15,
      margin: 0,
      maxWidth: 360,
      lineHeight: 1.5,
    },

    conversation: {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
    },

    conversationHeader: {
      height: isVerySmall ? 72 : 82,
      background: 'rgba(255, 255, 255, 0.96)',
      borderBottom: '1px solid #dbeafe',
      padding: isVerySmall ? '0 16px' : isTablet ? '0 20px' : '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)',
      zIndex: 2,
    },

    patientProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    patientName: {
      color: '#0f172a',
      fontSize: isVerySmall ? 17 : 20,
      margin: 0,
      fontWeight: 900,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    patientOnline: {
      color: '#16a34a',
      fontSize: 13,
      marginTop: 3,
      marginBottom: 0,
      fontWeight: 700,
    },

    patientOffline: {
      color: '#94a3b8',
    },

    closeThreadBtn: {
      width: isVerySmall ? 38 : 42,
      height: isVerySmall ? 38 : 42,
      border: '1px solid #dbeafe',
      borderRadius: '50%',
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 22,
      transition: '0.25s ease',
      flexShrink: 0,
    },

    chatMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: isVerySmall ? 16 : isTablet ? 20 : 26,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)',
    },

    messageRow: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: isVerySmall ? '90%' : isMobile ? '82%' : isSmallScreen ? '70%' : '62%',
    },

    messageRowSent: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },

    messageRowReceived: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },

    messageBubble: {
      padding: '12px 16px',
      borderRadius: 20,
      fontSize: 15,
      lineHeight: 1.5,
      wordBreak: 'break-word',
      boxShadow: '0 8px 18px rgba(15, 23, 42, 0.06)',
    },

    messageBubbleSent: {
      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      color: '#ffffff',
    },

    messageBubbleReceived: {
      background: '#ffffff',
      color: '#0f172a',
      border: '1px solid #dbeafe',
    },

    sentBubbleLast: {
      borderBottomRightRadius: 7,
    },

    receivedBubbleLast: {
      borderBottomLeftRadius: 7,
    },

    messageTime: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 5,
      fontWeight: 700,
    },

    messageStatus: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 5,
      fontWeight: 700,
    },

    dateDivider: {
      alignSelf: 'center',
      background: '#dbeafe',
      color: '#2563eb',
      fontSize: 12,
      padding: '7px 14px',
      borderRadius: 999,
      margin: '8px 0',
      fontWeight: 900,
      boxShadow: '0 8px 18px rgba(37, 99, 235, 0.08)',
    },

    messageInputContainer: {
      padding: isVerySmall ? 12 : '16px 22px',
      background: '#ffffff',
      borderTop: '1px solid #dbeafe',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: isVerySmall ? 8 : 12,
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 -8px 20px rgba(15, 23, 42, 0.04)',
    },

    messageInput: {
      flex: 1,
      padding: isVerySmall ? '12px 15px' : '14px 18px',
      border: '1px solid #bfdbfe',
      borderRadius: 999,
      outline: 'none',
      fontSize: 15,
      background: '#f8fbff',
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      minWidth: 0,
    },

    sendBtn: {
      width: isVerySmall ? 42 : 48,
      height: isVerySmall ? 42 : 48,
      border: 'none',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 18,
      transition: '0.25s ease',
      flexShrink: 0,
      boxShadow: '0 12px 20px rgba(37, 99, 235, 0.24)',
    },

    sendBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    messageError: {
      width: '100%',
      color: '#dc2626',
      fontSize: 13,
      fontWeight: 800,
    },

    noResult: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: 14,
      padding: 15,
    },

    newMessageModal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.58)',
      backdropFilter: 'blur(7px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: 20,
      boxSizing: 'border-box',
    },

    newMessageBox: {
      width: '100%',
      maxWidth: 440,
      background: '#ffffff',
      borderRadius: 26,
      padding: isVerySmall ? 22 : 28,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
      border: '1px solid #e0edff',
    },

    newMessageTitle: {
      fontSize: 23,
      color: '#0f172a',
      marginBottom: 6,
      marginTop: 0,
      fontWeight: 900,
    },

    newMessageText: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 16,
      marginTop: 0,
      lineHeight: 1.5,
    },

    newMessageInput: {
      width: '100%',
      padding: '14px 15px',
      border: '1px solid #bfdbfe',
      borderRadius: 14,
      outline: 'none',
      fontSize: 14,
      marginBottom: 18,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      background: '#f8fbff',
      color: '#0f172a',
    },

    newMessageActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    cancelNewMessage: {
      border: 'none',
      padding: '12px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      fontWeight: 900,
      background: '#f1f5f9',
      color: '#334155',
      width: isVerySmall ? '100%' : 'auto',
    },

    createNewMessage: {
      border: 'none',
      padding: '12px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      fontWeight: 900,
      background: '#2563eb',
      color: '#ffffff',
      width: isVerySmall ? '100%' : 'auto',
      boxShadow: '0 12px 20px rgba(37, 99, 235, 0.22)',
    },
  };
};

export default createRecepMessageStyles;
