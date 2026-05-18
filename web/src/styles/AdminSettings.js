const createAdminSettingsStyles = ({
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
      zIndex: 300,
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
      width: isMobile ? 55 : 125,
      height: 'auto',
    },

    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? 7 : 8,
      flex: 1,
    },

    menuItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: isMobile ? 0 : 12,
      padding: isMobile ? '13px 10px' : '13px 14px',
      borderRadius: 14,
      textDecoration: 'none',
      color: '#475569',
      transition: '0.2s ease',
      border: 'none',
      outline: 'none',
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
      background: 'linear-gradient(135deg, #60a5fa, #2563eb)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(37, 99, 235, 0.22)',
    },

    logoutSection: {
      paddingTop: 14,
    },

    dropdownDivider: {
      height: 1,
      background: '#e5e7eb',
      margin: '8px 0 12px',
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
      height: isMobile ? 74 : 78,
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
      gap: isMobile ? 10 : 18,
      height: '100%',
    },

    adminProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: isMobile ? 46 : 52,
      padding: isMobile ? '0 8px' : '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
    },

    avatar: {
      width: isMobile ? 36 : 40,
      height: isMobile ? 36 : 40,
      borderRadius: isMobile ? 12 : 13,
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
      color: '#64748b',
      marginTop: 2,
    },

    mainContent: {
      padding: isMobile ? '96px 14px 20px' : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      minHeight: isMobile ? 'auto' : 200,
      marginBottom: 20,
      padding: isMobile ? 24 : 30,
      borderRadius: isMobile ? 22 : 24,
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      maxWidth: isSmallScreen ? 650 : 760,
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 18,
    },

    heroTitle: {
      maxWidth: 720,
      fontSize: isMobile ? 24 : isSmallScreen ? 28 : 31,
      lineHeight: 1.3,
      color: '#ffffff',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      maxWidth: 650,
      color: '#eff6ff',
      fontSize: isMobile ? 13 : 14,
      lineHeight: 1.7,
      marginBottom: 0,
    },

    heroIconBox: {
      width: 95,
      height: 95,
      minWidth: 95,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.15)',
      display: isSmallScreen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIcon: {
      fontSize: 42,
      color: '#ffffff',
    },

    settingsTabs: {
      width: '100%',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 20 : 24,
      padding: isMobile ? 12 : 14,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      overflowX: 'auto',
      boxSizing: 'border-box',
    },

    settingsTab: {
      height: isMobile ? 48 : 50,
      padding: isMobile ? '0 16px' : '0 20px',
      borderRadius: 16,
      border: 'none',
      outline: 'none',
      background: '#eff6ff',
      color: '#2563eb',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      whiteSpace: 'nowrap',
      transition: '0.2s ease',
      fontSize: isMobile ? 13 : 14,
      fontFamily: 'Arial, sans-serif',
    },

    settingsTabActive: {
      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
      color: '#ffffff',
      borderColor: 'transparent',
      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)',
    },

    settingsTabIcon: {
      fontSize: 18,
    },

    toolbar: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      marginBottom: 20,
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 360,
      height: 48,
      padding: '0 15px',
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
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
      color: '#172554',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexDirection: isSmallScreen ? 'column' : 'row',
      width: isSmallScreen ? '100%' : 'auto',
    },

    selectInput: {
      height: 48,
      padding: '0 14px',
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      width: isSmallScreen ? '100%' : 'auto',
      minWidth: isSmallScreen ? '100%' : 160,
      boxSizing: 'border-box',
    },

    primaryBtn: {
      height: 48,
      border: 'none',
      outline: 'none',
      borderRadius: 14,
      padding: '0 18px',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      width: isSmallScreen ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      overflowX: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    accountCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 18 : 24,
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    accountHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 20,
      flexDirection: isMobile ? 'column' : 'row',
    },

    accountTitle: {
      margin: 0,
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    accountSubtitle: {
      margin: '5px 0 0',
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    successText: {
      margin: '0 0 16px',
      padding: '12px 14px',
      border: '1px solid #bbf7d0',
      borderRadius: 12,
      background: '#f0fdf4',
      color: '#15803d',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
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
      fontFamily: 'Arial, sans-serif',
    },

    accountDetailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
    },

    infoItem: {
      padding: 16,
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      minWidth: 0,
      boxSizing: 'border-box',
    },

    infoLabel: {
      display: 'block',
      marginBottom: 7,
      fontSize: 12,
      fontWeight: 700,
      color: '#2563eb',
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      display: 'block',
      color: '#0f172a',
      fontSize: 15,
      fontWeight: 700,
      overflowWrap: 'anywhere',
      fontFamily: 'Arial, sans-serif',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    branchTable: {
      width: '100%',
      minWidth: 1100,
      borderCollapse: 'collapse',
    },

    tableHead: {
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 13,
      textAlign: 'left',
      padding: 15,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
      borderBottom: '1px solid #edf0f5',
    },

    tableCell: {
      padding: 15,
      borderBottom: '1px solid #edf0f5',
      color: '#334155',
      fontSize: 14,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      background: '#ffffff',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    statusActive: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusInactive: {
      background: '#f1f5f9',
      color: '#64748b',
    },

    statusOpening: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    statusClosed: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    statusRenovation: {
      background: '#fef3c7',
      color: '#b45309',
    },

    editBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: 'none',
      outline: 'none',
      background: '#ffffff',
      color: '#2563eb',
      cursor: 'pointer',
      boxShadow: 'inset 0 0 0 1px #bfdbfe',
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 30,
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
      width: 36,
      height: 36,
      borderRadius: 12,
      border: 'none',
      outline: 'none',
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
      minWidth: 110,
      textAlign: 'center',
      fontSize: 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    overlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.62)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 16 : 22,
      boxSizing: 'border-box',
    },

    overlayContent: {
      width: 760,
      maxWidth: '100%',
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: isMobile ? 22 : 28,
      overflow: 'hidden',
      boxShadow: '0 28px 80px rgba(15, 23, 42, 0.35)',
    },

    overlayHeader: {
      padding: isMobile ? '20px 22px' : '24px 28px',
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    overlayTitle: {
      margin: 0,
      fontSize: isMobile ? 19 : 22,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    overlayClose: {
      width: 42,
      height: 42,
      border: 'none',
      outline: 'none',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
      fontSize: 28,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    overlayBody: {
      padding: isMobile ? 18 : 26,
      maxHeight: 'calc(90vh - 92px)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 18,
    },

    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },

    fieldWide: {
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    fieldLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#1e3a8a',
      fontFamily: 'Arial, sans-serif',
    },

    formInput: {
      width: '100%',
      height: 48,
      padding: '0 14px',
      borderRadius: 15,
      border: '1px solid #dbe3ef',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      background: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    readOnlyInput: {
      background: '#f8fafc',
      color: '#64748b',
      cursor: 'not-allowed',
    },

    formTextarea: {
      height: 110,
      paddingTop: 12,
      resize: 'vertical',
    },

    overlayActions: {
      marginTop: 26,
      display: 'flex',
      justifyContent: 'flex-end',
    },

    formActions: {
      marginTop: 26,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      flexDirection: isMobile ? 'column-reverse' : 'row',
    },

    secondaryBtn: {
      height: 48,
      padding: '0 22px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      background: '#ffffff',
      color: '#334155',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
      boxShadow: 'inset 0 0 0 1px #dbe3ef',
    },

    passwordHint: {
      margin: '14px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    saveBtn: {
      height: 48,
      padding: '0 26px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      background: 'linear-gradient(135deg, #16a34a, #22c55e)',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 10px 20px rgba(22, 163, 74, 0.18)',
      width: isMobile ? '100%' : 'auto',
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '100%' : 380,
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: 22,
      padding: 30,
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
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      marginBottom: 8,
      marginTop: 0,
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
      outline: 'none',
      borderRadius: 12,
      padding: 12,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      fontSize: 15,
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

export default createAdminSettingsStyles;
