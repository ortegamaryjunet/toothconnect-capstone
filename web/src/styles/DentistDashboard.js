const createDentistDashboardStyles = ({
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
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
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
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
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

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, 1fr)'
          : 'repeat(4, 1fr)',
      gap: 18,
      marginBottom: 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    statCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 20,
      padding: isMobile ? 14 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    statIconBlue: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    statIconPurple: {
      background: '#ede9fe',
      color: '#7c3aed',
    },

    statIconGreen: {
      background: '#dcfce7',
      color: '#16a34a',
    },

    statIconOrange: {
      background: '#ffedd5',
      color: '#f97316',
    },

    statIconImg: {
      width: 26,
      height: 26,
      objectFit: 'contain',
    },

    statLabel: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 5,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    statValue: {
      fontSize: isMobile ? 24 : 27,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1.15fr 1fr',
      gap: 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    panel: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    chartPanel: {},

    schedulePanel: {},

    feedbackPanel: {},

    ratingPanel: {},

    panelHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: isMobile ? 8 : 12,
      flexDirection: isMobile ? 'column' : 'row',
      width: '100%',
    },

    panelTitle: {
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    panelSubtitle: {
      fontSize: 13,
      color: '#64748b',
      marginTop: 3,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
    },

    panelLink: {
      fontSize: 13,
      textDecoration: 'none',
      color: '#2563eb',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    chartArea: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: isMobile ? 20 : 45,
      minHeight: 240,
      flexDirection: isMobile ? 'column' : 'row',
    },

    patientChartBox: {
      width: isMobile ? 190 : 220,
      height: isMobile ? 190 : 220,
      maxWidth: isMobile ? 190 : 220,
      maxHeight: isMobile ? 190 : 220,
      position: 'relative',
    },

    legend: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      gap: isMobile ? 12 : 14,
      color: '#475569',
      fontSize: 14,
      minWidth: isMobile ? '100%' : 100,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      justifyContent: isMobile ? 'center' : 'flex-start',
      fontFamily: 'Arial, sans-serif',
    },

    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
    },

    dot: {
      width: 11,
      height: 11,
      borderRadius: '50%',
      display: 'inline-block',
      flexShrink: 0,
    },

    dotChild: {
      background: '#facc15',
    },

    dotTeen: {
      background: '#38bdf8',
    },

    dotAdult: {
      background: '#22c55e',
    },

    dotOlder: {
      background: '#a78bfa',
    },

    appointmentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    feedbackList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    appointmentItem: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '82px 1fr auto',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
      background: '#f8fafc',
      borderRadius: 16,
      padding: 14,
      boxSizing: 'border-box',
    },

    time: {
      fontWeight: 700,
      color: '#2563eb',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    appointmentTitle: {
      fontSize: 14,
      color: '#0f172a',
      marginBottom: 3,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    appointmentText: {
      fontSize: 12,
      color: '#64748b',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    status: {
      padding: '6px 10px',
      borderRadius: 50,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusConfirmed: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    statusCompleted: {
      background: '#dcfce7',
      color: '#15803d',
    },

    feedbackItem: {
      padding: 15,
      background: '#f8fafc',
      borderLeft: '4px solid #60a5fa',
      borderRadius: 15,
    },

    feedbackText: {
      fontSize: 14,
      color: '#334155',
      lineHeight: 1.5,
      marginBottom: 8,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    feedbackMeta: {
      fontSize: 12,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    emptyBox: {
      padding: 20,
      textAlign: 'center',
      color: '#64748b',
      background: '#f8fafc',
      border: '1px dashed #cbd5e1',
      borderRadius: 16,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    ratingScore: {
      textAlign: 'center',
      padding: '10px 0 18px',
    },

    ratingValue: {
      fontSize: isMobile ? 42 : 48,
      color: '#2563eb',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    ratingLabel: {
      fontSize: 13,
      color: '#64748b',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    ratingBars: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },

    ratingRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 13,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    ratingNumber: {
      width: 15,
    },

    bar: {
      flex: 1,
      height: 8,
      borderRadius: 50,
      background: '#e5e7eb',
      overflow: 'hidden',
    },

    fill: {
      height: '100%',
      borderRadius: 50,
      background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
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
      fontWeight: 'bold'
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: 'black',
      fontWeight: 'bold'
    },

    dateFilter: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
    },

    select: {
      height: 40,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      borderRadius: 12,
      padding: '0 10px',
      fontFamily: 'Arial, sans-serif',
      outline: 'none',
      cursor: 'pointer',
      color: '#334155',
      minWidth: isMobile ? '100%' : 110,
      boxSizing: 'border-box',
    },

    visitChartBox: {
      position: 'relative',
      height: isMobile ? 220 : isTablet ? 240 : 260,
      width: '100%',
      minWidth: 0,
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

export default createDentistDashboardStyles;