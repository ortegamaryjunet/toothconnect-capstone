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

    patientHero: {
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

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isVerySmall || isMobile ? 18 : 22,
      padding: isVerySmall ? 15 : isMobile ? 18 : 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
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
      color: '#b8860b',
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
      display: 'flex',
      alignItems: isVerySmall ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 17 : 18,
      color: '#0f172a',
      margin: 0,
    },

    exportCsvBtn: {
      height: 43,
      minWidth: isVerySmall ? '100%' : 110,
      border: 'none',
      borderRadius: 14,
      background: 'linear-gradient(135deg, #15803d, #22c55e)',
      color: '#ffffff',
      padding: '0 18px',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      boxShadow: '0 8px 18px rgba(34, 197, 94, 0.24)',
      transition: '0.2s ease',
      whiteSpace: 'nowrap',
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
      minWidth: isVerySmall ? 900 : 1000,
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
      width: 270,
    },

    actionTd: {
      textAlign: 'center',
      width: 270,
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
      gap: 10,
      flexWrap: 'wrap',
    },

    actionBtn: {
      minWidth: 78,
      height: 40,
      padding: '0 14px',
      borderRadius: 12,
      border: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      cursor: 'pointer',
      transition: '0.2s ease',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    viewBtn: {
      background: '#eff6ff',
      color: '#2563eb',
    },

    editBtn: {
      background: '#fff8e1',
      color: '#b8860b',
    },

    pdfBtn: {
      minWidth: 90,
      background: 'linear-gradient(135deg, #f87171, #dc2626)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.24)',
    },

    pdfBtnIcon: {
      fontSize: 14,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
      flexWrap: 'wrap',
    },

    pageBtn: {
      minWidth: 58,
      height: 35,
      padding: '0 12px',
      border: '1px solid #f3d46b',
      borderRadius: 11,
      background: '#fff8e1',
      color: '#b8860b',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0,
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
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },

    smallModal: {
      width: 390,
      maxWidth: '100%',
      padding: isVerySmall ? '24px 20px' : 30,
      textAlign: 'center',
    },

    saveConfirmModal: {
      width: isMobile ? '100%' : 560,
      maxWidth: 560,
      padding: isVerySmall ? '24px 20px' : 30,
      textAlign: 'center',
    },

    modalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 18,
      padding: isVerySmall ? '20px 20px 18px' : '24px 28px 20px',
      borderBottom: '1px solid #e5e7eb',
      background: '#ffffff',
      flexShrink: 0,
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
      display: 'none',
      border: 'none',
      background: 'transparent',
      fontSize: 28,
      cursor: 'pointer',
      color: '#64748b',
      lineHeight: 1,
    },

    editModalBody: {
      padding: isVerySmall ? 20 : 28,
      overflowY: 'auto',
      boxSizing: 'border-box',
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
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      color: '#334155',
    },

    formSectionTitle: {
      gridColumn: '1 / -1',
      margin: '0 0 1px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 17,
      fontWeight: 800,
      letterSpacing: 0,
      textTransform: 'none',
      color: '#2563eb',
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

    phoneInputContainer: {
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      zIndex: 20,
    },

    phoneInput: {
      width: '100%',
      height: 48,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      paddingLeft: 54,
      outline: 'none',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    phoneButton: {
      height: 48,
      border: '1px solid #cbd5e1',
      borderRadius: '12px 0 0 12px',
      background: '#f8fafc',
    },

    phoneButtonDisabled: {
      background: '#f1f5f9',
      cursor: 'not-allowed',
    },

    phoneDropdown: {
      fontFamily: 'Arial, sans-serif',
      borderRadius: 12,
      overflow: 'auto',
      zIndex: 100000,
      boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
    },

    phoneSearch: {
      width: '90%',
      height: 34,
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      fontFamily: 'Arial, sans-serif',
    },

    readOnlyInput: {
      background: '#f8fafc',
      color: '#475569',
    },

    fieldInputError: {
      borderColor: '#dc2626',
      borderWidth: 2,
    },

    fieldErrorAsterisk: {
      color: '#dc2626',
      marginLeft: 3,
    },

    fieldErrorText: {
      margin: '4px 0 0',
      color: '#dc2626',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    textAreaField: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    textAreaInput: {
      height: 96,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '10px 12px',
      outline: 'none',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      background: '#ffffff',
      color: '#0f172a',
      resize: 'vertical',
    },

    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
      flexDirection: isMobile ? 'column' : 'row',
    },

    editModalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      padding: isVerySmall ? '16px 20px 20px' : '18px 28px 22px',
      borderTop: '1px solid #e5e7eb',
      background: '#ffffff',
      flexDirection: isMobile ? 'column' : 'row',
      flexShrink: 0,
    },

    centerActions: {
      justifyContent: 'center',
    },

    saveDetailsList: {
      width: '100%',
      maxHeight: isMobile ? 280 : 320,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 8,
    },

    saveDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '7px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: 13,
      textAlign: 'left',
    },

    saveDetailLabel: {
      color: '#64748b',
    },

    saveDetailValue: {
      color: '#0f172a',
      textAlign: 'right',
      maxWidth: isMobile ? 180 : 300,
      overflowWrap: 'anywhere',
    },

    saveBtn: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      background: '#d4af37',
      color: '#ffffff',
      fontWeight: 800,
      fontSize: 14,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    cancelModalBtn: {
      minWidth: 120,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      background: '#f1f5f9',
      color: '#0f172a',
      fontWeight: 800,
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
      fontWeight: 'bold',
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

    editConfirmIcon: {
      background: '#fff8e1',
      color: '#b8860b',
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

    exportModalOverlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    exportModalContent: {
      width: isMobile ? '100%' : 460,
      maxWidth: 460,
      background: '#ffffff',
      borderRadius: 12,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    exportModalTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isMobile ? 22 : 24,
      fontWeight: 800,
      color: '#111827',
      margin: '0 0 16px',
    },

    exportModalDivider: {
      height: 1,
      background: '#d1d5db',
      marginBottom: 22,
    },

    exportModalText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 15 : 17,
      lineHeight: 1.5,
      color: '#666666',
      margin: '0 0 28px',
    },

    exportModalButton: {
      width: '100%',
      height: 38,
      border: 'none',
      borderRadius: 8,
      background: '#d4af37',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
    },
  };
};

export default createRecepRecordsStyles;
