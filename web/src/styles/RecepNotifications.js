const createRecepNotificationsStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isTablet = false,
} = {}) => {
  const sidebarWidth = isVerySmall ? 74 : isMobile ? 88 : 250;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#f5f7fb',
      fontFamily: 'Arial, sans-serif',
      color: '#172033',
      display: 'flex',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      width: sidebarWidth,
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      padding: isVerySmall ? '16px 8px' : isMobile ? '18px 10px' : '22px 16px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isVerySmall ? 16 : isMobile ? 18 : 22,
      marginBottom: isMobile ? 12 : 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isVerySmall ? 46 : isMobile ? 54 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? 10 : 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 12,
      padding: isVerySmall ? '13px 8px' : isMobile ? '14px 10px' : '13px 14px',
      borderRadius: 14,
      textDecoration: 'none',
      color: '#475569',
      transition: '0.2s ease',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    menuItemIcon: {
      marginRight: isMobile ? 0 : 12,
      fontSize: isMobile && !isVerySmall ? 20 : 18,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.24)',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: 18,
      borderTop: '1px solid #e5e7eb',
    },

    logoutItem: {
      color: '#dc2626',
    },

    mainContainer: {
      marginLeft: sidebarWidth,
      minHeight: '100vh',
      width: `calc(100% - ${sidebarWidth}px)`,
      maxWidth: `calc(100% - ${sidebarWidth}px)`,
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    topHeader: {
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      height: isVerySmall || isTablet ? 76 : 86,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isVerySmall ? '0 14px' : isMobile ? '0 18px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
    },

    receptProfile: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      minHeight: 60,
      padding: isMobile ? 10 : '10px 20px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
    },

    avatar: {
      width: isVerySmall ? 34 : 40,
      height: isVerySmall ? 34 : 40,
      borderRadius: isVerySmall ? 12 : 13,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    avatarIcon: {
      fontSize: 18,
    },

    receptInfo: {
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      lineHeight: 1.2,
    },

    receptName: {
      fontSize: 16,
      fontWeight: 700,
      color: '#0f172a',
    },

    receptPosition: {
      marginTop: 2,
      fontSize: 15,
      color: '#64748b',
    },

    mainContent: {
      padding: isVerySmall
        ? '84px 14px 18px'
        : isTablet
          ? '88px 16px 20px'
          : isMobile
            ? '94px 18px 22px'
            : isSmallScreen
              ? '98px 22px 24px'
              : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : 190,
      borderRadius: isVerySmall ? 22 : isTablet ? 24 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isVerySmall ? 20 : isTablet ? 22 : isSmallScreen ? 26 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isMobile ? 18 : 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      minWidth: 0,
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: isTablet ? '5px 12px' : '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: isTablet ? 11 : 12,
      fontWeight: 600,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isVerySmall ? 20 : isTablet ? 22 : isMobile ? 24 : isSmallScreen ? 28 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: isSmallScreen ? 1.4 : 1.2,
    },

    heroText: {
      marginTop: 10,
      marginBottom: 0,
      color: '#ffffff',
      fontSize: isVerySmall ? 12 : isMobile ? 13 : 14,
      lineHeight: isMobile ? 1.6 : 1.5,
    },

    heroIcon: {
      width: isSmallScreen ? 78 : 90,
      height: isSmallScreen ? 78 : 90,
      minWidth: isSmallScreen ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIconText: {
      fontSize: isSmallScreen ? 36 : 42,
      color: '#ffffff',
    },

    notificationSummary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: isVerySmall ? 6 : 8,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isVerySmall ? 16 : 18,
      padding: isVerySmall ? 5 : 6,
      marginBottom: 18,
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
      width: isTablet ? '100%' : 'auto',
      overflowX: isTablet ? 'auto' : 'visible',
      boxSizing: 'border-box',
    },

    summaryTab: {
      height: isVerySmall ? 38 : 42,
      padding: isVerySmall ? '0 14px' : '0 20px',
      border: 'none',
      borderRadius: isVerySmall ? 11 : 12,
      background: 'transparent',
      color: '#64748b',
      fontSize: isVerySmall ? 13 : 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: '0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      minWidth: isTablet ? 'max-content' : 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    summaryTabActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 8px 18px rgba(37, 99, 235, 0.22)',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isTablet ? 20 : 20,
      padding: isTablet ? 16 : 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 14,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 360,
      minWidth: isSmallScreen ? '100%' : 'auto',
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 14px',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#2563eb',
      fontSize: 16,
    },

    searchInput: {
      width: '100%',
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      minWidth: 0,
    },

    notificationCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall ? 18 : isTablet ? 20 : 22,
      padding: isVerySmall ? 14 : isTablet ? 16 : 26,
      minHeight: 560,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
    },

    markAllBtn: {
      border: 'none',
      background: 'transparent',
      color: '#2563eb',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      padding: '4px 0',
      textDecoration: 'underline',
    },

    cardTitle: {
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    notificationList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    },

    notificationItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: isVerySmall ? 16 : isTablet ? 18 : 22,
      borderRadius: isVerySmall ? 18 : 20,
      border: '1px solid #edf0f5',
      transition: '0.2s ease',
      flexDirection: isVerySmall ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    notificationItemUnread: {
      borderLeft: '4px solid #2563eb',
    },

    notificationStatus: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      marginTop: isVerySmall ? 0 : 7,
      flexShrink: 0,
    },

    notificationStatusUnread: {
      background: '#2563eb',
    },

    notificationStatusRead: {
      background: '#cbd5e1',
    },

    notificationContent: {
      flex: 1,
      minWidth: 0,
    },

    notificationTitle: {
      fontSize: 15,
      color: '#0f172a',
      marginBottom: 6,
      marginTop: 0,
    },

    notificationMessage: {
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.6,
      margin: 0,
    },

    notificationTime: {
      marginTop: 10,
      fontSize: 12,
      color: '#94a3b8',
    },

    notificationActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: isVerySmall ? '100%' : 'auto',
      flexShrink: 0,
    },

    actionBtn: {
      width: 38,
      height: 38,
      border: '1px solid #e5e7eb',
      background: '#ffffff',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },

    readBtn: {
      color: '#16a34a',
    },

    unreadBtn: {
      color: '#2563eb',
    },

    markReadBtn: {
      border: 'none',
      borderRadius: 12,
      background: '#eff6ff',
      color: '#2563eb',
      padding: '10px 13px',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    emptyNotification: {
      minHeight: isVerySmall ? 300 : 420,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: '#94a3b8',
    },

    emptyNotificationIcon: {
      fontSize: 60,
      marginBottom: 14,
    },

    emptyNotificationText: {
      margin: 0,
      fontSize: 14,
      color: '#94a3b8',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isVerySmall ? '92%' : '100%',
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: isVerySmall ? 20 : 22,
      padding: isVerySmall ? '24px 18px' : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    modalIcon: {
      width: 72,
      height: 72,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: '#fee2e2',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalIconText: {
      fontSize: 32,
      lineHeight: 1,
    },

    modalTitle: {
      fontSize: 21,
      color: '#0f172a',
      marginBottom: 8,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    modalText: {
      fontSize: 15,
      color: '#64748b',
      marginBottom: 24,
      marginTop: 0,
      lineHeight: 1.5,
    },

    modalActions: {
      display: 'flex',
      gap: 12,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    modalButton: {
      flex: 1,
      border: 'none',
      borderRadius: 12,
      padding: 12,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
    },

    notificationBadge: {
      marginLeft: 'auto',
      minWidth: 22,
      height: 22,
      padding: '0 7px',
      borderRadius: 999,
      background: '#dc2626',
      color: '#ffffff',
      display: isVerySmall || isMobile ? 'none' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      boxSizing: 'border-box',
    },

    profileDropdownWrapper: {
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'stretch',
},

profileDropdown: {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '100%',
  minWidth: 170,
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 14,
  padding: 8,
  boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
  zIndex: 300,
  boxSizing: 'border-box',
},

viewProfileButton: {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: '#eff6ff',
  color: '#2563eb',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'Arial, sans-serif',
  textDecoration: 'none',
  cursor: 'pointer',
  boxSizing: 'border-box',
},
  };
};

export default createRecepNotificationsStyles;
