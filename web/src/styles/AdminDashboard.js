const createAdminDashboardStyles = ({
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
      fontFamily: '"Outfit", Arial, sans-serif',
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
      paddingTop: 14,
    },

    dropdownDivider: {
      height: 1,
      background: '#e5e7eb',
      marginBottom: 12,
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
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarIcon: {
      fontSize: 18,
    },

    adminInfo: {
      display: isMobile ? 'none' : 'block',
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

    dashboardHero: {
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
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 23 : 31,
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

    errorText: {
      margin: '0 0 16px',
      padding: '12px 14px',
      border: '1px solid #fecaca',
      borderRadius: 12,
      background: '#fef2f2',
      color: '#b91c1c',
      fontSize: 13,
      fontWeight: 600,
    },

    heroIcon: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 70 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isMobile ? 32 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      gap: isMobile ? 14 : 18,
      marginBottom: 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 22,
      padding: isMobile ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      minHeight: 115,
      width: '100%',
      minWidth: 0,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryIconBlue: {
      background: '#dbeafe',
    },

    summaryIconGreen: {
      background: '#dcfce7',
    },

    summaryIconPurple: {
      background: '#ede9fe',
    },

    summaryIconOrange: {
      background: '#ffedd5',
    },

    summaryIconImg: {
      width: 30,
      height: 30,
    },

    summaryLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: '#64748b',
      marginBottom: 5,
      marginTop: 0,
    },

    summaryValue: {
      fontWeight: 600,
      fontSize: 27,
      color: '#0f172a',
      margin: 0,
    },

    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : '1.35fr minmax(320px, 1fr)',
      gap: isMobile ? 16 : 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    dashboardCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    tallCard: {
      minHeight: isMobile ? 330 : 360,
    },

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 15,
      marginBottom: 18,
      flexDirection: isMobile ? 'column' : 'row',
      width: '100%',
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
    },

    cardSubtitle: {
      marginTop: 3,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
    },

    cardLink: {
      color: '#2563eb',
      textDecoration: 'none',
      fontSize: 13,
      fontFamily: '"Inter Bold", Arial, sans-serif',
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
      fontFamily: '"Outfit", Arial, sans-serif',
      outline: 'none',
      cursor: 'pointer',
      color: '#334155',
      maxWidth: '100%',
    },

    chartBox: {
      position: 'relative',
      height: isMobile ? 230 : 240,
      width: '100%',
      minWidth: 0,
    },

    emptyChart: {
      height: '100%',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      borderRadius: 16,
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 14,
      fontWeight: 600,
      padding: 18,
      boxSizing: 'border-box',
    },

    largeChart: {
      position: 'relative',
      height: isMobile ? 250 : 285,
      width: '100%',
      minWidth: 0,
    },

    stockNumbers: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 12,
      marginBottom: 18,
    },

    stockNumberBox: {
      background: '#f8fafc',
      borderRadius: 16,
      padding: 15,
      minWidth: 0,
    },

    stockNumberLabel: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 5,
      marginTop: 0,
    },

    stockNumberValue: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 20,
      margin: 0,
    },

    stockBar: {
      display: 'flex',
      height: 12,
      borderRadius: 50,
      overflow: 'hidden',
      width: '100%',
      marginBottom: 12,
      background: '#e5e7eb',
    },

    inStock: {
      background: '#2563eb',
      height: '100%',
    },

    lowStock: {
      background: '#f59e0b',
      height: '100%',
    },

    outStock: {
      background: '#ef4444',
      height: '100%',
    },

    stockLabels: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 12,
      color: '#64748b',
      gap: 8,
      flexWrap: 'wrap',
    },

    activityList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    activityItem: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      padding: 14,
      background: '#f8fafc',
      borderRadius: 15,
    },

    activityText: {
      fontSize: 14,
      marginBottom: 3,
      marginTop: 0,
      color: '#334155',
    },

    activitySmall: {
      color: '#64748b',
      fontSize: 12,
    },

    dot: {
      width: 10,
      height: 10,
      marginTop: 5,
      borderRadius: '50%',
      flexShrink: 0,
    },

    dotSuccess: {
      background: '#22c55e',
    },

    dotWarning: {
      background: '#f59e0b',
    },

    dotFailed: {
      background: '#ef4444',
    },

    ratingBox: {
      textAlign: 'center',
      padding: '10px 0 18px',
    },

    ratingValue: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 48,
      color: '#2563eb',
      margin: 0,
    },

    ratingLabel: {
      fontSize: 13,
      color: '#64748b',
      margin: 0,
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
    },

    ratingNumber: {
      width: 15,
    },

    bar: {
      flex: 1,
      height: 8,
      background: '#e5e7eb',
      borderRadius: 50,
      overflow: 'hidden',
    },

    fill: {
      height: '100%',
      background: 'linear-gradient(90deg, #60a5fa, #2563eb)',
      borderRadius: 50,
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
      background: '#dc2626',
      color: '#ffffff',
      borderRadius: 999,
      padding: '2px 7px',
      fontSize: 11,
      fontWeight: 700,
      display: isMobile ? 'none' : 'inline-flex',
    },
  };
};

export default createAdminDashboardStyles;
