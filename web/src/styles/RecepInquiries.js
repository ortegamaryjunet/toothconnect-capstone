const createRecepInquiriesStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isVerySmall ? 70 : isMobile ? 80 : 250;

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
      paddingBottom: 22,
      marginBottom: 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 55 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 12,
      padding: '13px 14px',
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
      fontSize: 18,
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
      background: '#d4af37',
      color: '#ffffff',
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      textDecoration: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    receptProfile: {
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

    receptInfo: {
      display: isMobile ? 'none' : 'block',
    },

    receptName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
    },

    receptPosition: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    mainContent: {
      padding: isVerySmall
        ? '88px 12px 20px'
        : isMobile
          ? '100px 18px 24px'
          : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'flex-start' : 'center',
      gap: 20,
      marginBottom: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 18 : isMobile ? 20 : isSmallScreen ? 24 : 28,
      borderRadius: isVerySmall ? 20 : 26,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      color: '#ffffff',
      boxShadow: '0 18px 38px rgba(37, 99, 235, 0.22)',
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      minWidth: 0,
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '7px 13px',
      borderRadius: 999,
      background: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
      fontSize: isVerySmall ? 12 : 13,
      fontWeight: 700,
      marginBottom: 12,
    },

    heroTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 19 : isMobile ? 21 : isSmallScreen ? 24 : 26,
      marginBottom: 8,
      marginTop: 0,
      lineHeight: 1.3,
    },

    heroText: {
      maxWidth: 620,
      fontSize: isVerySmall ? 13 : 14,
      lineHeight: 1.6,
      color: '#ffffff',
      margin: 0,
    },

    heroIcon: {
      width: isMobile ? 64 : 82,
      height: isMobile ? 64 : 82,
      borderRadius: isMobile ? 20 : 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isMobile ? 28 : 36,
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
      gap: isVerySmall ? 12 : 16,
      marginBottom: isVerySmall ? 18 : 22,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall || isMobile ? 18 : 22,
      padding: isVerySmall ? 14 : isMobile ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryIconWrap: {
      width: isVerySmall ? 40 : 44,
      height: isVerySmall ? 40 : 44,
      borderRadius: isVerySmall ? 12 : 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryLabel: {
      fontSize: isVerySmall ? 12 : 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 4,
    },

    summaryValue: {
      fontSize: isVerySmall ? 20 : 24,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall || isMobile ? 18 : 22,
      padding: isVerySmall ? 14 : isMobile ? 18 : 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 15,
      marginBottom: 18,
      flexDirection: isSmallScreen ? 'column' : 'row',
    },

    filterRight: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'flex-end',
      justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
      gap: 10,
      width: isSmallScreen ? '100%' : 'auto',
      flexDirection: isSmallScreen ? 'column' : 'row',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall || isMobile ? 18 : 22,
      padding: isVerySmall ? 14 : isMobile ? 18 : 24,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 18,
      flexWrap: 'wrap',
      gap: 12,
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 16 : 18,
      color: '#0f172a',
      margin: 0,
    },

    cardSubtitle: {
      fontSize: 13,
      color: '#64748b',
      margin: '4px 0 0',
      fontFamily: 'Arial, sans-serif',
    },

    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 16px',
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      background: '#f8fafc',
      cursor: 'pointer',
      fontSize: 13,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 350,
      height: isVerySmall ? 42 : 43,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: isVerySmall ? 12 : 14,
      padding: '0 13px',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#d4af37',
      fontSize: 16,
    },

    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#172033',
      minWidth: 0,
    },

    dateRangeRow: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-end',
      gap: 10,
      justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
      width: isSmallScreen ? '100%' : 'auto',
    },

    dateRangeGroup: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: isVerySmall ? '100%' : 150,
      flex: isMobile ? '1 1 100%' : '0 0 auto',
      gap: 6,
    },

    dateRangeLabel: {
      fontSize: 12,
      color: '#1e3a8a',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    dateRangeInput: {
      height: 43,
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 12px',
      background: '#ffffff',
      color: '#172033',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    dateRangeClearBtn: {
      height: 43,
      padding: '0 16px',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#f8fafc',
      color: '#475569',
      cursor: 'pointer',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      boxShadow: '0 1px 0 rgba(15, 23, 42, 0.04)',
    },

    dateRangeClearBtnPressed: {
      transform: 'scale(0.97)',
      boxShadow: '0 0 0 rgba(15, 23, 42, 0)',
    },

    loadingText: {
      textAlign: 'center',
      color: '#94a3b8',
      padding: 40,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    tableScroll: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: 14,
      border: '1px solid #edf0f5',
    },

    inquiryTable: {
      width: '100%',
      minWidth: isVerySmall ? 700 : 800,
      borderCollapse: 'collapse',
    },

    th: {
      padding: isVerySmall ? '12px 10px' : '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: isVerySmall ? 13 : 14,
      whiteSpace: 'nowrap',
      color: '#64748b',
      fontWeight: 700,
      background: '#f8fafc',
    },

    td: {
      padding: isVerySmall ? '12px 10px' : '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: isVerySmall ? 13 : 14,
      color: '#172033',
      verticalAlign: 'top',
    },

    emptyCell: {
      textAlign: 'center',
      padding: '40px',
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
    },

    pageBtn: {
      height: 35,
      padding: '0 14px',
      border: '1px solid #dbeafe',
      borderRadius: 11,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
    },

    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      textAlign: 'center',
      fontSize: 14,
      color: '#475569',
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
      flexDirection: isVerySmall ? 'column' : 'row',
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

    replyBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '7px 14px',
      border: 'none',
      borderRadius: 10,
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },

    replyCountBadge: {
      marginLeft: 6,
      background: 'rgba(255,255,255,0.3)',
      borderRadius: 999,
      padding: '1px 7px',
      fontSize: 11,
      fontWeight: 700,
    },

    replyOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      boxSizing: 'border-box',
    },

    replyModalBox: {
      width: '100%',
      maxWidth: 580,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: 22,
      boxShadow: '0 22px 60px rgba(15, 23, 42, 0.22)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },

    replyModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '20px 24px 16px',
      borderBottom: '1px solid #e5e7eb',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      flexShrink: 0,
    },

    replyModalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 17,
      fontWeight: 700,
      color: '#fff',
      marginBottom: 4,
    },

    replyModalSub: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      fontFamily: 'Arial, sans-serif',
    },

    replyCloseBtn: {
      background: 'rgba(255,255,255,0.2)',
      border: 'none',
      borderRadius: 10,
      width: 34,
      height: 34,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      fontSize: 20,
      flexShrink: 0,
    },

    replyModalBody: {
      padding: '20px 24px 24px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      flex: 1,
    },

    replyOriginalBox: {
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: '14px 16px',
    },

    replyOriginalLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: '#94a3b8',
      fontFamily: 'Arial, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      marginBottom: 6,
    },

    replyOriginalConcern: {
      fontSize: 13,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 4,
    },

    replyOriginalMsg: {
      fontSize: 13,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
    },

    replyHistoryBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },

    replyHistoryLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: '#94a3b8',
      fontFamily: 'Arial, sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
    },

    replyHistoryLoading: {
      fontSize: 13,
      color: '#94a3b8',
      fontFamily: 'Arial, sans-serif',
      margin: 0,
    },

    replyHistoryItem: {
      background: '#fffaf0',
      border: '1px solid #f3e8c0',
      borderLeft: '3px solid #d4af37',
      borderRadius: 10,
      padding: '10px 14px',
    },

    replyHistoryMeta: {
      fontSize: 11,
      color: '#94a3b8',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 5,
    },

    replyHistoryText: {
      fontSize: 13,
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
    },

    replyTextarea: {
      width: '100%',
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      padding: '12px 14px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#172033',
      background: '#f8fafc',
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.55,
      minHeight: 110,
    },

    replyErrorText: {
      fontSize: 13,
      color: '#dc2626',
      fontFamily: 'Arial, sans-serif',
      marginTop: -8,
    },

    replyModalActions: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
    },

    replyCancelBtn: {
      padding: '10px 20px',
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      background: '#f1f5f9',
      color: '#334155',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
    },

    replySendBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '10px 22px',
      border: 'none',
      borderRadius: 12,
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
    },
  };
};

export default createRecepInquiriesStyles;
