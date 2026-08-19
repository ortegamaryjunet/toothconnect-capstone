const createRecepMessageStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isTablet = false,
} = {}) => {
  const sidebarWidth = isMobile ? '100%' : isTablet ? 310 : isSmallScreen ? 330 : 360;
  const pagePadding = isVerySmall ? 14 : isTablet ? 20 : 28;

  return {
    chatContainer: {
      display: 'flex',
      width: '100%',
      height: isMobile ? 'auto' : '100vh',
      minHeight: '100vh',
      flexDirection: isMobile ? 'column' : 'row',
      background: 'linear-gradient(135deg, #fff8e1 0%, #fffdf7 45%, #f8f4e8 100%)',
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      overflow: isMobile ? 'visible' : 'hidden',
      boxSizing: 'border-box',
    },

    chatSidebar: {
      width: sidebarWidth,
      height: isMobile ? 'auto' : '100vh',
      maxHeight: isMobile ? '56vh' : 'none',
      background: '#ffffff',
      borderRight: isMobile ? 'none' : '1px solid #ead8a7',
      borderBottom: isMobile ? '1px solid #ead8a7' : 'none',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      boxShadow: isMobile
        ? '0 12px 30px rgba(15, 23, 42, 0.07)'
        : '10px 0 35px rgba(15, 23, 42, 0.07)',
      zIndex: 5,
      flexShrink: 0,
    },

    sidebarTop: {
      position: isMobile ? 'relative' : 'sticky',
      top: 0,
      background: '#ffffff',
      zIndex: 10,
      borderBottom: '1px solid #f1e6c7',
    },

    backBtn: {
      padding: isVerySmall ? '12px 14px 4px' : '16px 20px 6px',
    },

    backLink: {
      minWidth: 104,
      height: 40,
      padding: '0 15px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 11,
      border: '1px solid #e8c75f',
      background: '#fff8df',
      color: '#8b6508',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 800,
      fontFamily: '"Inter", Arial, sans-serif',
      transition: 'all .2s ease',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      padding: '6px 0 10px',
    },

    logoImg: {
      width: isVerySmall ? 108 : 122,
      height: 'auto',
      display: 'inline-block',
    },

    sidebarHeader: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: isVerySmall ? '0 14px 14px' : '0 20px 18px',
      gap: 13,
    },

    sidebarHeaderContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 5,
    },

    sidebarTitle: {
      fontSize: isVerySmall ? 21 : 24,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      margin: 0,
      fontWeight: 800,
      letterSpacing: '-0.4px',
    },

    sidebarSubtitle: {
      fontSize: isVerySmall ? 12.5 : 13,
      color: '#64748b',
      lineHeight: 1.45,
      margin: 0,
    },

    newChatSelectWrap: {
      width: '100%',
      minWidth: 0,
      height: 46,
      borderRadius: 13,
      background: '#fff8e1',
      border: '1px solid #ead8a7',
      color: '#8b6508',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '0 12px',
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 6px 16px rgba(139, 101, 8, 0.07)',
    },

    newChatSelectIcon: {
      color: '#d4af37',
      fontSize: 16,
      flexShrink: 0,
    },

    newChatSelect: {
      width: '100%',
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#0f172a',
      fontSize: 13.5,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    searchBox: {
      margin: isVerySmall ? '0 14px 10px' : '0 20px 12px',
      padding: '10px 13px',
      minHeight: 44,
      borderRadius: 13,
      background: '#fffdf7',
      border: '1px solid #ead8a7',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      boxSizing: 'border-box',
      boxShadow: '0 5px 14px rgba(15, 23, 42, 0.035)',
    },

    searchIcon: {
      color: '#d4af37',
      fontSize: 16,
      flexShrink: 0,
    },

    searchInput: {
      width: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    filterButtons: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 7,
      padding: isVerySmall ? '0 14px 12px' : '0 20px 14px',
    },

    filterBtn: {
      minWidth: 0,
      padding: '9px 8px',
      border: '1px solid transparent',
      borderRadius: 10,
      background: '#fffdf7',
      color: '#64748b',
      cursor: 'pointer',
      fontWeight: 800,
      fontSize: 12,
      transition: 'all .2s ease',
      fontFamily: 'Arial, sans-serif',
    },

    filterBtnActive: {
      background: '#d4af37',
      borderColor: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 7px 15px rgba(139, 101, 8, 0.18)',
    },

    chatList: {
      flex: 1,
      overflowY: 'auto',
      padding: isVerySmall ? '2px 9px 14px' : '2px 10px 18px',
      boxSizing: 'border-box',
      scrollbarWidth: 'thin',
    },

    chatItem: {
      width: '100%',
      display: 'flex',
      gap: 11,
      padding: isVerySmall ? '11px 10px' : '12px 11px',
      borderRadius: 15,
      cursor: 'pointer',
      transition: 'all .2s ease',
      marginBottom: 6,
      border: '1px solid transparent',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      position: 'relative',
    },

    chatItemActive: {
      background: '#fff8e1',
      border: '1px solid #ead8a7',
      boxShadow: '0 7px 18px rgba(139, 101, 8, 0.09)',
    },

    chatItemUnread: {
      background: '#fffdf7',
      border: '1px solid #ead8a7',
    },

    avatar: {
      width: 44,
      height: 44,
      borderRadius: 13,
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 16,
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: '0 7px 15px rgba(139, 101, 8, 0.18)',
    },

    avatarLarge: {
      width: isVerySmall ? 44 : 50,
      height: isVerySmall ? 44 : 50,
      borderRadius: 14,
    },

    chatInfo: {
      width: '100%',
      overflow: 'hidden',
      minWidth: 0,
      paddingTop: 1,
    },

    chatNameWrap: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      minWidth: 0,
    },

    chatRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 7,
      minWidth: 0,
    },

    chatName: {
      fontSize: 14,
      color: '#0f172a',
      margin: 0,
      fontWeight: 900,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    chatPreview: {
      fontSize: 12.5,
      color: '#64748b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: isVerySmall ? 145 : isTablet ? 180 : isSmallScreen ? 210 : 245,
      margin: '4px 0 0',
      lineHeight: 1.35,
    },

    chatTime: {
      fontSize: 11,
      color: '#94a3b8',
      flexShrink: 0,
      fontWeight: 700,
    },

    unreadBadge: {
      background: '#ef4444',
      color: '#ffffff',
      fontSize: 10,
      minWidth: 19,
      height: 19,
      padding: '0 5px',
      borderRadius: 999,
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontWeight: 900,
      flexShrink: 0,
      boxShadow: '0 5px 12px rgba(239, 68, 68, 0.2)',
    },

    chatMain: {
      flex: 1,
      height: isMobile ? '56vh' : '100vh',
      minHeight: isMobile ? 480 : 'auto',
      background: '#f8fbff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    emptyState: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      color: '#64748b',
      textAlign: 'center',
      padding: 30,
      boxSizing: 'border-box',
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 23,
      background: '#fff8e1',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 31,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.1)',
      border: '1px solid #ead8a7',
      marginBottom: 4,
    },

    emptyTitle: {
      color: '#0f172a',
      fontSize: isVerySmall ? 21 : 25,
      margin: 0,
      fontWeight: 900,
      letterSpacing: '-0.3px',
    },

    emptyText: {
      fontSize: 14,
      margin: 0,
      maxWidth: 370,
      lineHeight: 1.55,
      color: '#64748b',
    },

    conversation: {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      minWidth: 0,
    },

    conversationHeader: {
      minHeight: isVerySmall ? 70 : 78,
      background: 'rgba(255, 255, 255, 0.98)',
      borderBottom: '1px solid #ead8a7',
      padding: isVerySmall ? '0 14px' : isTablet ? '0 20px' : '0 26px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxSizing: 'border-box',
      boxShadow: '0 5px 18px rgba(15, 23, 42, 0.045)',
      zIndex: 2,
      flexShrink: 0,
    },

    patientProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      minWidth: 0,
    },

    patientName: {
      color: '#0f172a',
      fontSize: isVerySmall ? 16 : 19,
      margin: 0,
      fontWeight: 900,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    patientOnline: {
      color: '#16a34a',
      fontSize: 12,
      marginTop: 3,
      marginBottom: 0,
      fontWeight: 700,
    },

    patientOffline: {
      color: '#94a3b8',
    },

    closeThreadBtn: {
      width: isVerySmall ? 38 : 40,
      height: isVerySmall ? 38 : 40,
      border: '1px solid #ead8a7',
      borderRadius: 11,
      background: '#fff8e1',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 20,
      transition: 'all .2s ease',
      flexShrink: 0,
    },

    chatMessages: {
      flex: 1,
      overflowY: 'auto',
      padding: isVerySmall ? 14 : isTablet ? 18 : pagePadding,
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)',
      scrollbarWidth: 'thin',
    },

    messageRow: {
      display: 'flex',
      flexDirection: 'column',
      maxWidth: isVerySmall ? '92%' : isMobile ? '84%' : isSmallScreen ? '74%' : '64%',
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
      padding: isVerySmall ? '10px 13px' : '11px 15px',
      borderRadius: 17,
      fontSize: 14,
      lineHeight: 1.5,
      wordBreak: 'break-word',
      boxShadow: '0 5px 14px rgba(15, 23, 42, 0.055)',
    },

    messageBubbleSent: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      borderTopRightRadius: 6,
    },

    messageBubbleReceived: {
      background: '#ffffff',
      color: '#0f172a',
      border: '1px solid #ead8a7',
      borderTopLeftRadius: 6,
    },

    sentBubbleLast: {
      borderBottomRightRadius: 6,
    },

    receivedBubbleLast: {
      borderBottomLeftRadius: 6,
    },

    messageTime: {
      fontSize: 10.5,
      color: '#94a3b8',
      marginTop: 4,
      fontWeight: 700,
      padding: '0 2px',
    },

    messageStatus: {
      fontSize: 10.5,
      color: '#94a3b8',
      marginTop: 4,
      fontWeight: 700,
      padding: '0 2px',
    },

    dateDivider: {
      alignSelf: 'center',
      background: '#fff8e1',
      color: '#8b6508',
      fontSize: 11,
      padding: '6px 12px',
      borderRadius: 999,
      margin: '7px 0',
      fontWeight: 900,
      boxShadow: '0 5px 13px rgba(139, 101, 8, 0.07)',
      border: '1px solid #ead8a7',
    },

    messageInputContainer: {
      padding: isVerySmall ? 10 : '12px 18px',
      background: '#ffffff',
      borderTop: '1px solid #ead8a7',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: isVerySmall ? 7 : 10,
      boxSizing: 'border-box',
      flexShrink: 0,
      boxShadow: '0 -6px 18px rgba(15, 23, 42, 0.04)',
    },

    messageInput: {
      flex: 1,
      padding: isVerySmall ? '11px 13px' : '12px 16px',
      border: '1px solid #ead8a7',
      borderRadius: 14,
      outline: 'none',
      fontSize: 14,
      background: '#fffdf7',
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      minWidth: 0,
      minHeight: 44,
      boxSizing: 'border-box',
    },

    sendBtn: {
      width: isVerySmall ? 42 : 44,
      height: isVerySmall ? 42 : 44,
      border: 'none',
      borderRadius: 13,
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      fontSize: 17,
      transition: 'all .2s ease',
      flexShrink: 0,
      boxShadow: '0 8px 16px rgba(139, 101, 8, 0.2)',
    },

    sendBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },

    messageError: {
      width: '100%',
      color: '#dc2626',
      fontSize: 12.5,
      fontWeight: 800,
      marginTop: 1,
      paddingLeft: 2,
    },

    noResult: {
      textAlign: 'center',
      color: '#64748b',
      fontSize: 13,
      padding: 18,
      lineHeight: 1.5,
    },

    modal: {
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: '100%',
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 20,
      padding: isVerySmall ? 22 : 28,
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      boxSizing: 'border-box',
      border: '1px solid #ead8a7',
    },

    backModalContent: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isVerySmall ? '24px 20px' : '28px 24px',
      borderRadius: 20,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
      border: '1px solid #ead8a7',
    },

    modalIcon: {
      width: 64,
      height: 64,
      margin: '0 auto 14px',
      borderRadius: 18,
      background: '#fee2e2',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backModalIcon: {
      width: 74,
      height: 74,
      margin: '0 auto 14px',
      background: '#fee2e2',
      borderRadius: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
    },

    modalIconText: {
      fontSize: 30,
      lineHeight: 1,
    },

    modalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      margin: '0 0 8px',
      fontWeight: 800,
    },

    backModalTitle: {
      margin: '0 0 8px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 20,
      color: '#0f172a',
      fontWeight: 800,
    },

    modalText: {
      fontSize: 14,
      color: '#64748b',
      margin: '0 0 22px',
      lineHeight: 1.55,
      fontFamily: 'Arial, sans-serif',
    },

    backModalText: {
      margin: '0 0 22px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#64748b',
      lineHeight: 1.55,
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 9,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    backModalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 9,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    modalButton: {
      minWidth: 116,
      height: 42,
      borderRadius: 11,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
      fontWeight: 800,
      transition: 'all .2s ease',
    },

    backModalButton: {
      minWidth: isVerySmall ? '100%' : 100,
      border: 'none',
      borderRadius: 11,
      padding: '11px 17px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 13,
      transition: 'all .2s ease',
    },

    cancelModalBtn: {
      background: '#f1f5f9',
      color: '#334155',
    },

    backCancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },

    confirmModalBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    backConfirmBtn: {
      background: '#dc2626',
      color: '#ffffff',
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
      padding: 18,
      boxSizing: 'border-box',
    },

    newMessageBox: {
      width: '100%',
      maxWidth: 440,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 20 : 26,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
      border: '1px solid #ead8a7',
    },

    newMessageHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },

    newMessageTitleWrap: {
      minWidth: 0,
    },

    newMessageTitle: {
      fontSize: 21,
      color: '#0f172a',
      margin: 0,
      fontWeight: 900,
      letterSpacing: '-0.2px',
    },

    newMessageText: {
      fontSize: 13,
      color: '#64748b',
      margin: '5px 0 0',
      lineHeight: 1.5,
    },

    newMessageClose: {
      width: 36,
      height: 36,
      border: '1px solid #ead8a7',
      borderRadius: 10,
      background: '#fff8e1',
      color: '#8b6508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 19,
      flexShrink: 0,
    },

    newMessageField: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 14,
    },

    newMessageLabel: {
      fontSize: 12,
      fontWeight: 800,
      color: '#334155',
    },

    newMessageInput: {
      width: '100%',
      padding: '12px 13px',
      border: '1px solid #ead8a7',
      borderRadius: 12,
      outline: 'none',
      fontSize: 14,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      background: '#fffdf7',
      color: '#0f172a',
    },

    newMessageActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 9,
      flexDirection: isVerySmall ? 'column' : 'row',
      marginTop: 18,
    },

    cancelNewMessage: {
      border: 'none',
      padding: '11px 17px',
      borderRadius: 11,
      cursor: 'pointer',
      fontWeight: 900,
      background: '#f1f5f9',
      color: '#334155',
      width: isVerySmall ? '100%' : 'auto',
      fontSize: 13,
    },

    createNewMessage: {
      border: 'none',
      padding: '11px 17px',
      borderRadius: 11,
      cursor: 'pointer',
      fontWeight: 900,
      background: '#d4af37',
      color: '#ffffff',
      width: isVerySmall ? '100%' : 'auto',
      boxShadow: '0 8px 16px rgba(139, 101, 8, 0.18)',
      fontSize: 13,
    },
  };
};

export default createRecepMessageStyles;