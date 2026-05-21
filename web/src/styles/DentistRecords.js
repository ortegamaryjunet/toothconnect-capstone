const createDentistRecordsStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

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
      padding: isMobile ? '16px 8px' : isTablet ? '18px 10px' : '22px 16px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isMobile ? 16 : isTablet ? 18 : 22,
      marginBottom: isMobile ? 12 : 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 46 : isTablet ? 54 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isTablet ? 10 : 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile || isTablet ? 'center' : 'flex-start',
      gap: isMobile || isTablet ? 0 : 12,
      padding: isMobile ? '13px 8px' : isTablet ? '14px 10px' : '13px 14px',
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
      marginRight: isMobile || isTablet ? 0 : 12,
      fontSize: isTablet ? 20 : 18,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile || isTablet ? 'none' : 'inline',
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
      paddingTop: isTablet ? 14 : 18,
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
      height: isMobile ? 70 : 78,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isMobile ? '0 14px' : isTablet ? '0 18px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
    },

    doctorProfile: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      minHeight: isTablet ? 'auto' : 52,
      padding: isTablet ? 8 : '8px 18px',
      borderRadius: isMobile ? 14 : 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
    },

    avatar: {
      width: isMobile ? 34 : 40,
      height: isMobile ? 34 : 40,
      borderRadius: isMobile ? 12 : 13,
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

    doctorInfo: {
      display: isMobile || isTablet ? 'none' : 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      lineHeight: 1.2,
    },

    doctorName: {
      fontSize: 15,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    doctorSpecialization: {
      marginTop: 2,
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    mainContent: {
      padding: isMobile
        ? '84px 14px 18px'
        : isTablet
          ? '94px 18px 22px'
          : isSmallScreen
            ? '98px 22px 24px'
            : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroCard: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : 190,
      borderRadius: isMobile ? 22 : isTablet ? 24 : 28,
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      padding: isMobile ? 20 : isTablet ? 22 : isSmallScreen ? 26 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isSmallScreen ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isTablet ? 18 : 24,
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: isMobile ? '5px 12px' : '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: isMobile ? 11 : 12,
      fontWeight: 600,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 20 : isTablet ? 24 : isSmallScreen ? 28 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: isSmallScreen ? 1.4 : 1.2,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isMobile ? 12 : 14,
      lineHeight: isSmallScreen ? 1.6 : 1.5,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
    },

    heroIcon: {
      width: isSmallScreen ? 78 : 90,
      height: isSmallScreen ? 78 : 90,
      minWidth: isSmallScreen ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: isTablet || isMobile ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isSmallScreen ? 36 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 14 : 18,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: 15,
      marginBottom: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 330,
      height: isMobile ? 42 : 43,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 13px',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#2563eb',
      fontSize: 15,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#172033',
    },

    filterGroup: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      gap: 10,
      width: isSmallScreen ? '100%' : 'auto',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: isSmallScreen && !isMobile ? 'wrap' : 'nowrap',
    },

    filterInput: {
      height: 43,
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      padding: '0 12px',
      color: '#334155',
      outline: 'none',
      width: isMobile ? '100%' : 'auto',
      flex: isSmallScreen && !isMobile ? 1 : 'initial',
      minWidth: isSmallScreen && !isMobile ? 190 : 'auto',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    filterSelect: {
      height: 43,
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      padding: '0 12px',
      color: '#334155',
      outline: 'none',
      width: isMobile ? '100%' : 'auto',
      flex: isSmallScreen && !isMobile ? 1 : 'initial',
      minWidth: isSmallScreen && !isMobile ? 190 : 'auto',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 14 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    tableHeader: {
      marginBottom: 18,
    },

    tableTitle: {
      fontSize: isMobile ? 16 : 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    patientTable: {
      width: '100%',
      minWidth: 950,
      borderCollapse: 'collapse',
    },

    tableHead: {
      padding: isMobile ? '13px 10px' : '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: isMobile ? 13 : 14,
      color: '#64748b',
      fontWeight: 700,
      background: '#f8fafc',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableCell: {
      padding: isMobile ? '13px 10px' : '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: isMobile ? 13 : 14,
      color: '#334155',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      background: '#ffffff',
    },

    treatmentPill: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 50,
      background: '#eff6ff',
      color: '#2563eb',
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    viewBtn: {
      minWidth: 70,
      height: 36,
      borderRadius: 12,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      border: 'none',
      cursor: 'pointer',
    },

    viewBtnIcon: {
      fontSize: 15,
      color: '#ffffff',
    },

    emptyRow: {
      textAlign: 'center',
      padding: 17,
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      borderBottom: '1px solid #edf0f5',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
    },

    pageBtn: {
      width: isMobile ? 33 : 35,
      height: isMobile ? 33 : 35,
      border: '1px solid #dbeafe',
      borderRadius: 11,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },

    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      textAlign: 'center',
      fontSize: isMobile ? 13 : 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '92%' : 380,
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? '24px 18px' : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
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
      fontSize: 28,
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
      fontFamily: 'Arial, sans-serif',
    },

    modalActions: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      flex: 1,
      border: 'none',
      borderRadius: 12,
      padding: 12,
      cursor: 'pointer',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: 'black',
      fontWeight: 'bold',
    },

    notificationBadge: {
      marginLeft: 'auto',
      background: '#dc2626',
      color: '#ffffff',
      borderRadius: 999,
      padding: '2px 7px',
      fontSize: 11,
      fontWeight: 700,
      display: isMobile || isTablet ? 'none' : 'inline-flex',
    },
  };
};

export default createDentistRecordsStyles;