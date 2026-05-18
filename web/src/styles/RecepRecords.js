const createRecepRecordsStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isVerySmall ? 70 : isMobile ? 80 : 250;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#f4f7fb',
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
      padding: isVerySmall ? '14px 8px' : isMobile ? '18px 10px' : '22px 16px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isVerySmall ? 16 : 22,
      marginBottom: isVerySmall ? 10 : 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isVerySmall ? 48 : isMobile ? 55 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isVerySmall ? 6 : 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 12,
      padding: isVerySmall ? '12px 8px' : isMobile ? '13px 10px' : '13px 14px',
      borderRadius: isVerySmall ? 12 : 14,
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
      fontSize: isVerySmall ? 17 : 18,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(37, 99, 235, 0.22)',
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
      height: isVerySmall ? 76 : 86,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: isVerySmall ? '0 12px' : isMobile ? '0 18px' : '0 28px',
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

    receptProfile: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      minHeight: isVerySmall ? 52 : 60,
      padding: isVerySmall ? 8 : '10px 20px',
      borderRadius: isVerySmall ? 14 : 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    avatar: {
      width: isVerySmall ? 36 : 40,
      height: isVerySmall ? 36 : 40,
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
        ? '88px 12px 20px'
        : isMobile
          ? '100px 18px 24px'
          : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    patientHero: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'flex-start' : 'center',
      gap: 20,
      marginBottom: isVerySmall ? 18 : 22,
      padding: isVerySmall ? 18 : isMobile ? 20 : isSmallScreen ? 24 : 28,
      borderRadius: isVerySmall ? 20 : 26,
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      color: '#ffffff',
      boxShadow: '0 18px 38px rgba(37, 99, 235, 0.22)',
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
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
      color: '#eaf2ff',
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

    dashboardCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall || isMobile ? 18 : 22,
      padding: isVerySmall ? 15 : isMobile ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    cardHeader: {
      marginBottom: 18,
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 17 : 18,
      color: '#0f172a',
      margin: 0,
    },

    filters: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      gap: 15,
      marginBottom: 18,
      flexDirection: isSmallScreen ? 'column' : 'row',
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
      color: '#2563eb',
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

    genderFilter: {
      height: isVerySmall ? 42 : 43,
      minWidth: isSmallScreen ? '100%' : 170,
      width: isSmallScreen ? '100%' : 'auto',
      padding: '0 13px',
      border: '1px solid #dbe3ef',
      borderRadius: isVerySmall ? 12 : 14,
      background: '#ffffff',
      outline: 'none',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },

    tableScroll: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: 18,
      border: '1px solid #edf0f5',
    },

    patientTable: {
      width: '100%',
      minWidth: isVerySmall ? 820 : 900,
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
      whiteSpace: 'nowrap',
      color: '#172033',
    },

    tr: {
      background: '#ffffff',
    },

    actionTh: {
      textAlign: 'center',
      width: 110,
    },

    actionTd: {
      textAlign: 'center',
      width: 110,
    },

    genderBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 999,
      background: '#e0f2fe',
      color: '#0369a1',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 12,
    },

    emptyCell: {
      textAlign: 'center',
      padding: '30px',
      color: '#64748b',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
    },

    btnGroup: {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
    },

    actionBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: '0.2s ease',
    },

    viewBtn: {
      background: '#ecfdf5',
      color: '#16a34a',
      border: '1px solid #bbf7d0',
    },

    editBtn: {
      background: '#eff6ff',
      color: '#2563eb',
      border: '1px solid #bfdbfe',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
    },

    pageBtn: {
      width: 35,
      height: 35,
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
      fontSize: 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.48)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      background: '#ffffff',
      borderRadius: 22,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      boxSizing: 'border-box',
      maxHeight: '90vh',
      overflowY: 'auto',
    },

    largeModal: {
      width: 760,
      maxWidth: '96%',
      padding: isVerySmall ? 20 : 28,
    },

    smallModal: {
      width: 390,
      maxWidth: '100%',
      padding: isVerySmall ? '24px 20px' : 30,
      textAlign: 'center',
    },

    modalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 18,
      marginBottom: 22,
    },

    modalHeaderTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      color: '#0f172a',
      fontSize: isVerySmall ? 20 : 23,
      margin: 0,
    },

    modalHeaderText: {
      marginTop: 4,
      color: '#64748b',
      fontSize: 13,
      marginBottom: 0,
    },

    modalX: {
      border: 'none',
      background: 'transparent',
      fontSize: 28,
      cursor: 'pointer',
      color: '#64748b',
      lineHeight: 1,
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
    },

    detailBox: {
      background: '#f8fbff',
      border: '1px solid #dbeafe',
      borderRadius: 16,
      padding: 14,
      minWidth: 0,
    },

    detailLabel: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
      color: '#475569',
    },

    detailValue: {
      marginTop: 6,
      marginBottom: 0,
      color: '#0f172a',
      fontSize: 15,
      wordBreak: 'break-word',
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 15,
    },

    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    },

    fieldLabel: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
      color: '#475569',
    },

    fieldInput: {
      height: 44,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '0 12px',
      outline: 'none',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      background: '#ffffff',
      color: '#0f172a',
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
      flexDirection: isMobile ? 'column' : 'row',
    },

    centerActions: {
      justifyContent: 'center',
    },

    saveBtn: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 14,
    },

    cancelModalBtn: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      background: '#f1f5f9',
      color: '#334155',
      fontSize: 14,
    },

    logoutBtn: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      background: '#ef4444',
      color: '#ffffff',
      fontSize: 14,
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
      fontSize: isVerySmall ? 20 : 22,
      marginBottom: 10,
      marginTop: 0,
      color: '#0f172a',
    },

    modalText: {
      color: '#64748b',
      lineHeight: 1.5,
      marginTop: 0,
      marginBottom: 0,
      fontSize: 15,
    },
  };
};

export default createRecepRecordsStyles;