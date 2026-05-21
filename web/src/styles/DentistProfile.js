const createDentistProfileStyles = ({
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

    avatarSmall: {
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

    errorBanner: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 16,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
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

    profileHeader: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 18 : 24,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 18 : 16,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      marginBottom: 24,
      boxSizing: 'border-box',
    },

    profileLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },

    profileAvatar: {
      width: isMobile ? 60 : 72,
      height: isMobile ? 60 : 72,
      borderRadius: isMobile ? 18 : 20,
      background: '#2563eb',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? 22 : 24,
      fontWeight: 700,
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
    },

    profileName: {
      fontSize: isMobile ? 22 : 28,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    profileSubtext: {
      marginTop: 6,
      marginBottom: 0,
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    editBtn: {
      border: 'none',
      background: '#2563eb',
      color: '#ffffff',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    disabledBtn: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },

    profileGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr',
      gap: 24,
    },

    card: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 18 : 24,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    fullCard: {
      gridColumn: isSmallScreen ? 'span 1' : '1 / 3',
    },

    cardTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: '1px solid #e2e8f0',
    },

    cardTitleIcon: {
      width: 42,
      height: 42,
      background: '#dbeafe',
      color: '#2563eb',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 19,
      flexShrink: 0,
    },

    cardTitleText: {
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16,
    },

    infoGridFour: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? '1fr 1fr'
          : 'repeat(4, 1fr)',
      gap: 16,
    },

    infoItem: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 16,
      boxSizing: 'border-box',
    },

    infoItemFull: {
      gridColumn: isMobile ? 'span 1' : '1 / 3',
    },

    infoLabel: {
      display: 'block',
      color: '#64748b',
      fontSize: 13,
      marginBottom: 7,
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      color: '#0f172a',
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
    },

    subTitle: {
      margin: '24px 0 12px',
      fontSize: 15,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    emptyBox: {
      background: '#f8fafc',
      border: '1px dashed #93c5fd',
      color: '#64748b',
      padding: 18,
      borderRadius: 16,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },

    editOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 14 : 20,
      zIndex: 9999,
      boxSizing: 'border-box',
    },

    editModalBox: {
      width: '100%',
      maxWidth: 760,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 24,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    editModalHeader: {
      padding: isMobile ? '20px 18px' : '22px 24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    editModalTitle: {
      fontSize: isMobile ? 19 : 22,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    modalClose: {
      border: 'none',
      background: '#eff6ff',
      color: '#2563eb',
      width: 38,
      height: 38,
      borderRadius: 12,
      cursor: 'pointer',
      fontSize: 20,
      flexShrink: 0,
    },

    editForm: {
      padding: isMobile ? 18 : 24,
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },

    formGroupFull: {
      gridColumn: isMobile ? 'span 1' : '1 / 3',
    },

    formLabel: {
      display: 'block',
      fontSize: 13,
      color: '#475569',
      marginBottom: 7,
      fontFamily: 'Arial, sans-serif',
    },

    formInput: {
      width: '100%',
      border: '1px solid #cbd5e1',
      background: '#f8fafc',
      borderRadius: 14,
      padding: '13px 14px',
      fontSize: 14,
      outline: 'none',
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    formTextarea: {
      minHeight: 90,
      resize: 'vertical',
    },

    editModalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
      flexDirection: isMobile ? 'column' : 'row',
    },

    saveBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      cursor: 'pointer',
      background: '#2563eb',
      color: '#ffffff',
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    cancelEditBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      cursor: 'pointer',
      background: '#e2e8f0',
      color: '#334155',
      width: isMobile ? '100%' : 'auto',
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

export default createDentistProfileStyles;
