const createAdminEmployeesStyles = ({
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
      zIndex: 200,
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
      height: isMobile ? 72 : 78,
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
      padding: isMobile ? '92px 14px 20px' : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : isSmallScreen ? 170 : 190,
      borderRadius: isMobile ? 22 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 22 : isSmallScreen ? 28 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isMobile ? 18 : 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: isSmallScreen ? 620 : 760,
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
      marginBottom: isMobile ? 14 : 16,
    },

    heroTitle: {
      maxWidth: '100%',
      fontSize: isMobile ? 22 : isSmallScreen ? 29 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: isMobile ? 1.3 : 1.2,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 1.6 : 1.5,
      marginBottom: 0,
    },

    heroIconBox: {
      width: isMobile ? 68 : 90,
      height: isMobile ? 68 : 90,
      minWidth: isMobile ? 68 : 90,
      borderRadius: isMobile ? 18 : 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIcon: {
      fontSize: isMobile ? 30 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    employeeSummary: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? 'repeat(2, 1fr)'
          : 'repeat(3, 1fr)',
      gap: isMobile ? 14 : 18,
      marginBottom: 18,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 15,
      minHeight: isMobile ? 95 : 110,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryCardIcon: {
      width: 54,
      height: 54,
      borderRadius: 16,
      background: '#dbeafe',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryCardImg: {
      width: 32,
      height: 32,
      objectFit: 'contain',
    },

    summaryCardText: {
      display: 'flex',
      flexDirection: 'column',
    },

    summaryCardTitle: {
      fontSize: 13,
      color: '#64748b',
      marginBottom: 5,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    summaryCardNumber: {
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: isMobile ? 24 : 27,
      color: '#0f172a',
      margin: 0,
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 18,
      display: 'flex',
      flexDirection: isSmallScreen ? 'column' : 'row',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 15,
      marginBottom: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 330,
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
      fontSize: 15,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#172033',
    },

    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: isSmallScreen ? '100%' : 'auto',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: isSmallScreen ? 'space-between' : 'flex-start',
      flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
    },

    roleFilter: {
      height: 43,
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      padding: '0 12px',
      fontFamily: 'Arial, sans-serif',
      color: '#334155',
      outline: 'none',
      width: isMobile ? '100%' : isSmallScreen ? 'auto' : 'auto',
      flex: isSmallScreen && !isMobile ? 1 : 'initial',
      minWidth: isMobile ? '100%' : 180,
      boxSizing: 'border-box',
    },

    addEmployeeBtn: {
      height: 43,
      padding: '0 16px',
      borderRadius: 14,
      border: '1px solid #d4af37',
      background: '#d4af37',
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      whiteSpace: 'nowrap',
      textDecoration: 'none',
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    addEmployeeIcon: {
      fontSize: 14,
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    tableHeader: {
      marginBottom: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      flexWrap: isMobile ? 'wrap' : 'nowrap',
    },

    tableTitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
      fontWeight: 700,
    },

    exportBtn: {
      height: 43,
      minWidth: isMobile ? '100%' : 110,
      border: 'none',
      borderRadius: 14,
      color: '#ffffff',
      padding: '0 18px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: 'linear-gradient(135deg, #15803d, #22c55e)',
      boxShadow: '0 8px 18px rgba(212, 175, 55, 0.25)',
      transition: '0.2s ease',
      whiteSpace: 'nowrap',
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    exportIcon: {
      fontSize: 15,
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    employeeTable: {
      width: '100%',
      minWidth: 1080,
      borderCollapse: 'collapse',
    },

    tableHead: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#64748b',
      fontWeight: 700,
      background: '#f8fafc',
      whiteSpace: 'nowrap',
    },

    tableCell: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      whiteSpace: 'nowrap',
    },

    tableRow: {
      background: '#ffffff',
    },

    actionGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },

    viewBtn: {
      minWidth: 70,
      height: 36,
      borderRadius: 12,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      border: 'none',
      cursor: 'pointer',
    },

    pdfBtn: {
      minWidth: 78,
      height: 36,
      padding: '0 14px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, #f87171, #dc2626)',
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    pdfBtnIcon: {
      fontSize: 14,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 24,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      borderBottom: '1px solid #edf0f5',
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
      width: isMobile ? 33 : 35,
      height: isMobile ? 33 : 35,
      border: '1px solid #dbeafe',
      borderRadius: 11,
      background: '#eff6ff',
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

    employeeModal: {
      display: 'flex',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 14 : 22,
      boxSizing: 'border-box',
    },

    employeeModalContent: {
      width: '100%',
      maxWidth: 1050,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: isMobile ? 18 : 24,
      boxShadow: '0 22px 60px rgba(15, 23, 42, 0.25)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    },

    employeeModalHeader: {
      padding: isMobile ? '18px 18px' : '22px 26px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      background: '#ffffff',
    },

    employeeModalTitle: {
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 20 : 24,
      fontWeight: 800,
      color: '#0f172a',
    },

    employeeModalSubtitle: {
      margin: '5px 0 0',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#64748b',
    },

    employeeModalCloseBtn: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      border: 'none',
      background: '#f1f5f9',
      color: '#0f172a',
      fontSize: 25,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
    },

    employeeModalBody: {
      padding: isMobile ? 16 : 24,
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    employeeModalSection: {
      border: '1px solid #e2e8f0',
      borderRadius: 18,
      padding: isMobile ? 15 : 20,
      marginBottom: 18,
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    employeeModalSectionTitle: {
      margin: '0 0 16px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 17,
      color: '#2563eb',
      fontWeight: 800,
    },

    employeeModalGridTwo: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
      gap: 16,
      marginBottom: 16,
    },

    employeeModalGridThree: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: 16,
    },

    employeeModalField: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      minWidth: 0,
    },

    employeeModalLabel: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      color: '#334155',
    },

    employeeModalInput: {
      width: '100%',
      minHeight: 43,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '10px 12px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    employeeModalInputReadOnly: {
      background: '#f8fafc',
      color: '#475569',
      cursor: 'default',
    },

    employeeModalActions: {
      padding: isMobile ? '16px 18px' : '18px 26px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
      background: '#ffffff',
    },

    employeeEditBtn: {
      minWidth: isMobile ? '100%' : 120,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      background: '#2563eb',
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    employeeSaveBtn: {
      minWidth: isMobile ? '100%' : 150,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      background: '#16a34a',
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    employeeCloseBtn: {
      minWidth: isMobile ? '100%' : 120,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      background: '#f1f5f9',
      color: '#0f172a',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
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
      fontFamily: 'Arial, sans-serif',
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

export default createAdminEmployeesStyles;
