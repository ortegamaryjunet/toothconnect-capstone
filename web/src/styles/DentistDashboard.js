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
      overflowX: 'hidden',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isMobile || isTablet ? 18 : 22,
      marginBottom: isMobile || isTablet ? 12 : 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 52 : isTablet ? 58 : 125,
      height: 'auto',
      maxWidth: '100%',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile || isTablet ? 8 : 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile || isTablet ? 'center' : 'flex-start',
      gap: isMobile || isTablet ? 0 : 12,
      padding: isMobile || isTablet ? '13px 0' : '13px 14px',
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
      width: '100%',
      minWidth: 0,
    },

    menuItemIcon: {
      marginRight: isMobile || isTablet ? 0 : 12,
      fontSize: 18,
      verticalAlign: 'middle',
      flexShrink: 0,
    },

    menuItemText: {
      display: isMobile || isTablet ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.15,
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.24)',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isMobile || isTablet ? 14 : 18,
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
      height: isMobile ? 72 : 78,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isMobile ? '0 12px' : isTablet ? '0 18px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
      minWidth: 0,
    },

    doctorProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: isMobile ? '0 10px' : '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      minWidth: 0,
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 13,
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
      display: isMobile ? 'none' : 'block',
      minWidth: 0,
    },

    doctorName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
      whiteSpace: 'nowrap',
    },

    doctorSpecialization: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
      whiteSpace: 'nowrap',
    },

    mainContent: {
      padding: isMobile
        ? '88px 12px 18px'
        : isTablet
          ? '96px 18px 22px'
          : isSmallScreen
            ? '98px 20px 24px'
            : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroCard: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 165 : isTablet ? 190 : 225,
      borderRadius: isMobile ? 20 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 18 : isTablet ? 22 : 30,
      marginBottom: isMobile ? 16 : 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 20,
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
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 22 : isTablet ? 26 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: isMobile ? 68 : isTablet ? 78 : 90,
      height: isMobile ? 68 : isTablet ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isMobile ? 32 : isTablet ? 36 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      gap: isMobile ? 12 : 18,
      marginBottom: isMobile ? 16 : 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    statCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 20,
      padding: isMobile ? 14 : isTablet ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
    },

    statIcon: {
      width: isMobile ? 44 : 48,
      height: isMobile ? 44 : 48,
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
      gap: isMobile ? 16 : 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    panel: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : isTablet ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
    },

    chartPanel: {
      minWidth: 0,
    },

    schedulePanel: {
      minWidth: 0,
    },

    feedbackPanel: {
      minWidth: 0,
    },

    ratingPanel: {
      minWidth: 0,
    },

    panelHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: 18,
      gap: isMobile ? 10 : 12,
      flexDirection: isMobile ? 'column' : 'row',
      width: '100%',
      minWidth: 0,
    },

    panelTitle: {
      fontSize: isMobile ? 17 : 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.25,
    },

    panelSubtitle: {
      fontSize: 13,
      color: '#64748b',
      marginTop: 3,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.35,
    },

    panelLink: {
      fontSize: 13,
      textDecoration: 'none',
      color: '#2563eb',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
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
      gridTemplateColumns: isMobile ? '1fr' : '82px minmax(0, 1fr) auto',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 12,
      background: '#f8fafc',
      borderRadius: 16,
      padding: 14,
      boxSizing: 'border-box',
      minWidth: 0,
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
      width: 'fit-content',
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
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '100%' : 460,
      maxWidth: 460,
      background: '#ffffff',
      borderRadius: 12,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    modalIcon: {
      display: 'none',
    },

    modalIconText: {
      display: 'none',
    },

    modalTitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 22 : 24,
      fontWeight: 800,
      color: '#111827',
      margin: '0 0 16px',
    },

    modalDivider: {
      height: 1,
      background: '#d1d5db',
      marginBottom: 22,
    },

    modalText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 15 : 17,
      lineHeight: 1.5,
      color: '#666666',
      margin: '0 0 28px',
    },

    modalActions: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    modalButton: {
      flex: 1,
      width: isMobile ? '100%' : 'auto',
      height: 38,
      border: 'none',
      borderRadius: 8,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    cancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
    },

    dateFilter: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      width: isMobile ? '100%' : 'auto',
      minWidth: 0,
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
      height: isMobile ? 220 : isTablet ? 245 : 260,
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
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