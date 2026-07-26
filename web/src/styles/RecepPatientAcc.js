const createRecepPatientAccStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isStacked = false,
  isSingleColumn = false,
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
        ? '88px 12px 18px'
        : isMobile
          ? '100px 18px 24px'
          : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    accountHero: {
      position: 'relative',
      width: '100%',
      minHeight: isStacked ? 'auto' : 190,
      borderRadius: isSingleColumn ? 20 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isVerySmall ? 20 : isSingleColumn ? 24 : 30,
      marginBottom: isVerySmall ? 18 : 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isStacked ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
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
      fontSize: isVerySmall ? 20 : isSingleColumn ? 22 : isStacked ? 25 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isSingleColumn ? 13 : 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: isStacked ? 76 : 90,
      height: isStacked ? 76 : 90,
      minWidth: isStacked ? 76 : 90,
      borderRadius: isStacked ? 22 : 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isStacked ? 35 : 42,
      color: '#ffffff',
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isSingleColumn
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(3, minmax(190px, 1fr))',
      gap: 18,
      marginBottom: 18,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isSingleColumn ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      padding: isSingleColumn ? 18 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      minHeight: isVerySmall ? 95 : 'auto',
      boxSizing: 'border-box',
    },

    summaryIcon: {
      width: isVerySmall ? 44 : 50,
      height: isVerySmall ? 44 : 50,
      borderRadius: isVerySmall ? 13 : 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryIconText: {
      fontSize: 22,
    },

    summaryIconBlue: {
      background: '#eff6ff',
      color: '#b8860b',
    },

    summaryIconGreen: {
      background: '#ecfdf5',
      color: '#16a34a',
    },

    summaryIconOrange: {
      background: '#fff7ed',
      color: '#ea580c',
    },

    summaryLabel: {
      fontSize: 13,
      color: '#64748b',
      margin: 0,
    },

    summaryValue: {
      marginTop: 4,
      marginBottom: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 23 : 26,
      color: '#0f172a',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isSingleColumn ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      padding: isVerySmall ? 16 : isSingleColumn ? 18 : 20,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: isStacked ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 15,
      marginBottom: 18,
      flexDirection: isStacked ? 'column' : 'row',
    },

    searchBox: {
      width: isStacked ? '100%' : 330,
      height: 43,
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
      color: '#b8860b',
    },

    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      minWidth: 0,
      color: '#172033',
    },

    filterRight: {
      display: 'flex',
      alignItems: isStacked ? 'stretch' : 'center',
      justifyContent: isStacked ? 'flex-start' : 'flex-end',
      gap: 10,
      width: isStacked ? '100%' : 'auto',
      flexDirection: isStacked ? 'column' : 'row',
    },

    patientFilter: {
      height: 43,
      minWidth: 180,
      width: isStacked ? '100%' : 'auto',
      padding: '0 13px',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      outline: 'none',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      boxSizing: 'border-box',
    },

    addAccountBtn: {
      height: 43,
      padding: '0 16px',
      borderRadius: 14,
      border: '1px solid #d4af37',
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      whiteSpace: 'nowrap',
      width: isStacked ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    dashboardCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isSingleColumn ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      padding: isVerySmall ? 16 : isSingleColumn ? 18 : 22,
      boxSizing: 'border-box',
    },

    cardHeader: {
      display: 'flex',
      alignItems: isSingleColumn ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 18,
      marginBottom: 18,
      flexDirection: isSingleColumn ? 'column' : 'row',
    },

    cardTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 16 : 18,
      color: '#0f172a',
      margin: 0,
    },

    cardSubtitle: {
      marginTop: 3,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
    },

    exportCsvBtn: {
      height: 43,
      minWidth: isSingleColumn ? '100%' : 110,
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
      borderRadius: 16,
    },

    accountTable: {
      width: '100%',
      minWidth: isVerySmall ? 860 : 950,
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

    actionTh: {
      textAlign: 'center',
      width: 100,
    },

    actionTd: {
      textAlign: 'center',
      width: 100,
    },

    status: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 11px',
      borderRadius: 999,
      fontSize: 12,
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    statusActive: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusInactive: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    editBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: '1px solid #bfdbfe',
      background: '#d4af37',
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    },

    emptyCell: {
      textAlign: 'center',
      padding: '30px',
      color: '#64748b',
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isSingleColumn ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 18,
    },

    pageBtn: {
      width: 35,
      height: 35,
      border: '1px solid #f3d46b',
      borderRadius: 11,
      background: '#fff8e1',
      color: '#b8860b',
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

    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20,
      boxSizing: 'border-box',
    },

    overlayContent: {
      width: 760,
      maxWidth: '96%',
      maxHeight: '92vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: 22,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
    },

    overlayHeader: {
      padding: '22px 26px',
      borderBottom: '1px solid #edf0f5',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 18,
      flexDirection: isSingleColumn ? 'column' : 'row',
    },

    overlayTitle: {
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 22,
      color: '#0f172a',
      margin: 0,
    },

    overlaySubtitle: {
      marginTop: 4,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
    },

    closeBtn: {
      border: 'none',
      background: 'transparent',
      fontSize: 28,
      color: '#64748b',
      cursor: 'pointer',
      alignSelf: isSingleColumn ? 'flex-end' : 'flex-start',
      lineHeight: 1,
    },

    overlayBody: {
      padding: 26,
    },

    formError: {
      marginBottom: 14,
      padding: '11px 12px',
      borderRadius: 10,
      border: '1px solid #fca5a5',
      background: '#fff7f7',
      color: '#dc2626',
      fontSize: 14,
      fontFamily: '"Inter Bold", Arial, sans-serif',
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
      width: '100%',
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '0 12px',
      outline: 'none',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      color: '#172033',
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    inputWithAction: {
      position: 'relative',
      width: '100%',
    },

    fieldInputWithAction: {
      paddingRight: 70,
    },

    fieldInputReadonly: {
      background: '#f8fafc',
      color: '#64748b',
      cursor: 'not-allowed',
    },

    fieldInputError: {
      borderColor: '#dc2626',
      background: '#fff7f7',
    },

    fieldError: {
      color: '#dc2626',
      fontSize: 12,
      lineHeight: 1.35,
    },

    passwordToggle: {
      position: 'absolute',
      top: '50%',
      right: 8,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'transparent',
      color: '#8b6508',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 12,
      cursor: 'pointer',
      padding: '6px 4px',
    },

    overlayActions: {
      marginTop: 24,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      flexDirection: isSingleColumn ? 'column' : 'row',
    },

    submitBtn: {
      minWidth: 130,
      width: isSingleColumn ? '100%' : 'auto',
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      background: '#2563eb',
      color: '#ffffff',
    },

    cancelOverlayBtn: {
      minWidth: 130,
      width: isSingleColumn ? '100%' : 'auto',
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      background: '#f1f5f9',
      color: '#334155',
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
      width: isVerySmall ? '100%' : 390,
      maxWidth: '96%',
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
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
  };
};

export default createRecepPatientAccStyles;
