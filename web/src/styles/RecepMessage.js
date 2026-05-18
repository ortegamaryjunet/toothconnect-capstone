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
      background: '#eef4ff',
      fontFamily: 'Arial, sans-serif',
      color: '#172554',
      overflow: isMobile ? 'visible' : 'hidden',
      boxSizing: 'border-box',
    },

    chatSidebar: {
      width: isMobile ? '100%' : isTablet ? 340 : isSmallScreen ? 370 : 410,
      height: isMobile ? 'auto' : '100vh',
      maxHeight: isMobile ? '48vh' : 'none',
      background: '#ffffff',
      borderRight: isMobile ? 'none' : '1px solid #dbeafe',
      borderBottom: isMobile ? '1px solid #dbeafe' : 'none',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    sidebarTop: {
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      background: '#ffffff',
      zIndex: 10,
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
      fontWeight: 700,
      padding: '10px 14px',
      borderRadius: 12,
      background: '#eff6ff',
      border: 'none',
      cursor: 'pointer',
      transition: '0.25s ease',
      fontFamily: 'Arial, sans-serif',
    },

    logo: {
      textAlign: 'center',
      padding: '8px 0 14px',
    },

    logoImg: {
      width: isVerySmall ? 120 : 135,
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
      gap: 10,
    },

    sidebarTitle: {
      fontSize: isVerySmall ? 23 : 27,
      color: '#172554',
      margin: 0,
      fontWeight: 700,
    },

    sidebarSubtitle: {
      fontSize: isVerySmall ? 14 : 15,
      color: '#64748b',
      lineHeight: 1.45,
      marginTop: 2,
      marginBottom: 0,
    },

    newChatSelectWrap: {
      width: '100%',
      minWidth: 0,
      maxWidth: isVerySmall ? '100%' : 220,
      height: 48,
      borderRadius: 14,
      background: '#eff6ff',
      border: '1px solid #dbeafe',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 10px',
      boxSizing: 'border-box',
      flexShrink: 0,
    },

    newChatSelectIcon: {
      color: '#2563eb',
      fontSize: 18,
      flexShrink: 0,
    },

    newChatSelect: {
      width: '100%',
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#172554',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    searchBox: {
      margin: isVerySmall ? '0 14px 12px' : '0 20px 14px',
      padding: '12px 14px',
      borderRadius: 14,
      background: '#f8fbff',
      border: '1px solid #dbeafe',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxSizing: 'border-box',
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
      color: '#172554',
      fontFamily: 'Arial, sans-serif',
    },

    filterButtons: {
      display: 'flex',
      gap: 8,
      padding: isVerySmall ? '0 14px 14px' : '0 20px 16px',
    },

    filterBtn: {
      flex: 1,
      padding: 10,
      border: 'none',
      borderRadius: 12,
      background: '#f1f5f9',
      color: '#475569',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 14,
      transition: '0.25s ease',
      fontFamily: 'Arial, sans-serif',
    },

    filterBtnActive: {
      background: '#2563eb',
      color: '#ffffff',
    },

    chatList: {
      flex: 1,
      overflowY: 'auto',
      padding: isVerySmall ? '0 8px' : '0 10px 14px',
      maxHeight: isMobile ? 220 : 'none',
      boxSizing: 'border-box',
    },

    chatItem: {
      width: '100%',
      display: 'flex',
      gap: 12,
      padding: '14px 10px',
      borderRadius: 16,
      cursor: 'pointer',
      transition: '0.25s ease',
      marginBottom: 8,
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    chatItemActive: {
      background: '#eff6ff',
    },

    chatItemUnread: {
      background: '#f8fbff',
    },

    avatar: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 18,
      fontWeight: 800,
      flexShrink: 0,
    },

    avatarLarge: {
      width: 50,
      height: 50,
    },

    chatInfo: {
      width: '100%',
      overflow: 'hidden',
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
      fontSize: 16,
      color: '#172554',
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    chatPreview: {
      fontSize: 14,
      color: '#64748b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: isVerySmall ? 150 : isTablet ? 190 : isSmallScreen ? 220 : 260,
      margin: 0,
    },

    chatTime: {
      fontSize: 12,
      color: '#94a3b8',
      flexShrink: 0,
    },

    unreadBadge: {
      background: '#ef4444',
      color: '#ffffff',
      fontSize: 12,
      minWidth: 20,
      height: 20,
      borderRadius: '50%',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 700,
      flexShrink: 0,
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
      width: 80,
      height: 80,
      borderRadius: 28,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 34,
    },

    emptyTitle: {
      color: '#172554',
      fontSize: isVerySmall ? 24 : 28,
      margin: 0,
    },

    emptyText: {
      fontSize: 15,
      margin: 0,
    },

    conversation: {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
    },

    conversationHeader: {
      height: isVerySmall ? 70 : 78,
      background: '#ffffff',
      borderBottom: '1px solid #dbeafe',
      padding: isVerySmall ? '0 16px' : isTablet ? '0 20px' : '0 26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      boxSizing: 'border-box',
      flexShrink: 0,
    },

    patientProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    patientName: {
      color: '#172554',
      fontSize: 20,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    patientOnline: {
      color: '#22c55e',
      fontSize: 14,
      marginTop: 3,
      marginBottom: 0,
    },

    patientOffline: {
      color: '#94a3b8',
    },

    closeThreadBtn: {
      width: isVerySmall ? 38 : 42,
      height: isVerySmall ? 38 : 42,
      border: 'none',
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
      padding: isVerySmall ? 16 : isTablet ? 20 : 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      boxSizing: 'border-box',
    },

    messageRow: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: isVerySmall
        ? '90%'
        : isMobile
          ? '82%'
          : isSmallScreen
            ? '70%'
            : '62%',
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
      borderRadius: 18,
      fontSize: 15,
      lineHeight: 1.5,
      wordBreak: 'break-word',
    },

    messageBubbleSent: {
      background: '#2563eb',
      color: '#ffffff',
    },

    messageBubbleReceived: {
      background: '#ffffff',
      color: '#172554',
      border: '1px solid #dbeafe',
    },

    sentBubbleLast: {
      borderBottomRightRadius: 6,
    },

    receivedBubbleLast: {
      borderBottomLeftRadius: 6,
    },

    messageTime: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 5,
    },

    messageStatus: {
      fontSize: 12,
      color: '#94a3b8',
      marginTop: 5,
    },

    dateDivider: {
      alignSelf: 'center',
      background: '#e0edff',
      color: '#2563eb',
      fontSize: 13,
      padding: '6px 14px',
      borderRadius: 20,
      margin: '6px 0',
      fontWeight: 700,
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
    },

    messageInput: {
      flex: 1,
      padding: isVerySmall ? '12px 15px' : '14px 18px',
      border: '1px solid #dbeafe',
      borderRadius: 25,
      outline: 'none',
      fontSize: 15,
      background: '#f8fbff',
      fontFamily: 'Arial, sans-serif',
      color: '#172554',
      minWidth: 0,
    },

    sendBtn: {
      width: isVerySmall ? 42 : 46,
      height: isVerySmall ? 42 : 46,
      border: 'none',
      borderRadius: '50%',
      background: '#2563eb',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 18,
      transition: '0.25s ease',
      flexShrink: 0,
    },

    sendBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
    },

    messageError: {
      width: '100%',
      color: '#dc2626',
      fontSize: 13,
      fontWeight: 700,
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
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: 20,
      boxSizing: 'border-box',
    },

    newMessageBox: {
      width: '100%',
      maxWidth: 430,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 22 : 26,
      boxShadow: '0 20px 45px rgba(15, 23, 42, 0.18)',
      boxSizing: 'border-box',
    },

    newMessageTitle: {
      fontSize: 22,
      color: '#172554',
      marginBottom: 6,
      marginTop: 0,
    },

    newMessageText: {
      fontSize: 14,
      color: '#64748b',
      marginBottom: 14,
      marginTop: 0,
    },

    newMessageInput: {
      width: '100%',
      padding: '13px 15px',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      outline: 'none',
      fontSize: 14,
      marginBottom: 18,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
    },

    newMessageActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 10,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    cancelNewMessage: {
      border: 'none',
      padding: '11px 18px',
      borderRadius: 12,
      cursor: 'pointer',
      fontWeight: 800,
      background: '#f1f5f9',
      color: '#334155',
      width: isVerySmall ? '100%' : 'auto',
    },

    createNewMessage: {
      border: 'none',
      padding: '11px 18px',
      borderRadius: 12,
      cursor: 'pointer',
      fontWeight: 800,
      background: '#2563eb',
      color: '#ffffff',
      width: isVerySmall ? '100%' : 'auto',
    },
  };
};

export default createRecepMessageStyles;
