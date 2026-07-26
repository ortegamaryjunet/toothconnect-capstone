const createRecepDashboardStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isStackedHero = false,
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
      background: '#eff6ff',
      color: '#2563eb',
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
        ? '88px 12px 18px'
        : isMobile
          ? '100px 18px 24px'
          : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    dashboardHero: {
      position: 'relative',
      width: '100%',
      minHeight: isVerySmall ? 'auto' : 190,
      borderRadius: isVerySmall ? 18 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isVerySmall ? 20 : isMobile ? 24 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile || isStackedHero ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isStackedHero ? 20 : 24,
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'left',
      boxSizing: 'border-box',
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
      fontSize: isVerySmall ? 20 : isStackedHero ? 26 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isVerySmall ? 13 : 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: 90,
      height: 90,
      minWidth: 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIconText: {
      fontSize: 42,
      color: '#ffffff',
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isVerySmall
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(3, minmax(0, 1fr))',
      gap: 18,
      marginBottom: 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      minHeight: isVerySmall ? 100 : 115,
      width: '100%',
      minWidth: 0,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryIcon: {
      width: isVerySmall ? 44 : 50,
      height: isVerySmall ? 44 : 50,
      borderRadius: isVerySmall ? 13 : 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryIconText: {
      fontSize: 23,
    },

    summaryIconBlue: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    summaryIconGreen: {
      background: '#dcfce7',
      color: '#16a34a',
    },

    summaryIconPurple: {
      background: '#ede9fe',
      color: '#7c3aed',
    },

    summaryIconOrange: {
      background: '#ffedd5',
      color: '#ea580c',
    },

    summaryLabel: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 5,
      marginTop: 0,
    },

    summaryValue: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 24 : 27,
      color: '#0f172a',
      margin: 0,
    },

    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : '1.35fr minmax(300px, 0.9fr)',
      gap: 22,
      width: '100%',
      boxSizing: 'border-box',
    },

    dashboardCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    clinicOverviewCard: {
      minHeight: isSmallScreen ? 'auto' : 260,
    },

    tallCard: {
      minHeight: isVerySmall ? 330 : isMobile ? 340 : 360,
    },

    stockCard: {
      minHeight: isSmallScreen ? 'auto' : 260,
    },

    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 15,
      marginBottom: 18,
      flexDirection: isVerySmall ? 'column' : 'row',
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

    dateFilter: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      width: isVerySmall ? '100%' : 'auto',
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
      maxWidth: '100%',
      minWidth: isVerySmall ? '100%' : 120,
      boxSizing: 'border-box',
    },

    largeChart: {
      position: 'relative',
      height: isVerySmall ? 240 : isMobile ? 250 : 285,
      width: '100%',
      minWidth: 0,
    },

    viewAllLink: {
      textDecoration: 'none',
      fontSize: 14,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#2563eb',
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
      color: '#0f172a',
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
      width: isVerySmall ? '100%' : 380,
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 24 : 30,
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
  };
};

export default createRecepDashboardStyles;
