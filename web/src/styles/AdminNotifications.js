const createAdminNotifStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isMobile ? 80 : 230;

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
      padding: isMobile ? '18px 10px' : '22px 16px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isMobile ? 18 : 22,
      marginBottom: isMobile ? 12 : 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 54 : 125,
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
      padding: isMobile ? '14px 10px' : '13px 14px',
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
      fontSize: isMobile ? 20 : 18,
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
      height: 78,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isMobile ? '0 14px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
    },

    adminProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 13,
      background: '#d4af37',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarIcon: {
      fontSize: 18,
    },

    adminInfo: {
      display: isMobile ? 'none' : 'block',
      textAlign: 'left',
    },

    adminName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
    },

    adminPosition: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    mainContent: {
      padding: isMobile ? '96px 14px 22px' : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 170 : 225,
      borderRadius: isMobile ? 22 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 20 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'left',
      boxSizing: 'border-box',
      boxShadow: '0 18px 40px rgba(185, 140, 20, 0.22)',
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 16,
      fontFamily: 'Arial, sans-serif',
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 23 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    heroIconBox: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 70 : 90,
      minWidth: isMobile ? 70 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIcon: {
      fontSize: isMobile ? 32 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    notificationSummary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: isMobile ? 6 : 8,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 16 : 18,
      padding: isMobile ? 5 : 6,
      marginBottom: 18,
      boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)',
      width: isTablet ? '100%' : 'auto',
      overflowX: isTablet ? 'auto' : 'visible',
      boxSizing: 'border-box',
    },

    summaryTab: {
      height: isMobile ? 38 : 42,
      padding: isMobile ? '0 14px' : '0 20px',
      border: 'none',
      borderRadius: isMobile ? 11 : 12,
      background: 'transparent',
      color: '#64748b',
      fontSize: isMobile ? 13 : 14,
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
      borderRadius: 20,
      padding: 16,
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
      color: '#b8860b',
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
      borderRadius: isMobile ? 18 : isTablet ? 20 : 22,
      padding: isMobile ? 14 : isTablet ? 16 : 26,
      minHeight: 560,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    cardHeader: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 14,
      flexDirection: isMobile ? 'column' : 'row',
    },

    markAllBtn: {
      border: '1px solid #f3d46b',
      background: '#fff8e1',
      color: '#b8860b',
      height: 42,
      padding: '0 18px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: '0.2s ease',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      textDecoration: 'none',
      width: isMobile ? '100%' : 'auto',
    },

    markAllBtnIcon: {
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#b8860b',
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
      padding: isMobile ? 16 : isTablet ? 18 : 22,
      borderRadius: isMobile ? 18 : 20,
      border: '1px solid #edf0f5',
      transition: '0.2s ease',
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    notificationItemUnread: {
      borderLeft: '4px solid #b8860b',
    },

    notificationStatus: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      marginTop: isMobile ? 0 : 7,
      flexShrink: 0,
    },

    notificationStatusUnread: {
      background: '#b8860b',
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
      fontFamily: 'Arial, sans-serif',
    },

    notificationMessage: {
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.6,
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    notificationTime: {
      marginTop: 10,
      fontSize: 12,
      color: '#94a3b8',
      fontFamily: 'Arial, sans-serif',
    },

    notificationActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: isMobile ? '100%' : 'auto',
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
      color: '#b8860b',
    },

    emptyNotification: {
      minHeight: isMobile ? 300 : 420,
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
      fontFamily: 'Arial, sans-serif',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '100%' : 390,
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 12,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    modalIcon: {
      width: 70,
      height: 70,
      margin: '0 auto 16px',
      borderRadius: '50%',
      background: '#fee2e2',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    modalIconText: {
      fontSize: 30,
      lineHeight: 1,
    },

    modalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 22,
      color: '#0f172a',
      marginBottom: 10,
      marginTop: 0,
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
      justifyContent: 'center',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
      fontWeight: 'bold',
    },

    notificationBadge: {
      marginLeft: 'auto',
      minWidth: 22,
      height: 22,
      padding: '0 7px',
      borderRadius: 999,
      background: '#dc2626',
      color: '#ffffff',
      display: isMobile ? 'none' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      boxSizing: 'border-box',
    },
  };
};

export default createAdminNotifStyles;
