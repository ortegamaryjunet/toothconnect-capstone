const createInventoryPageStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
  desktopSidebarWidth = 230,
} = {}) => {
  const sidebarWidth = isMobile ? 80 : desktopSidebarWidth;

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

    tabCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 14,
      display: 'flex',
      flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
      gap: 10,
      marginBottom: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    tabBtn: {
      height: 42,
      padding: '0 18px',
      border: 'none',
      outline: 'none',
      borderRadius: 14,
      background: '#eff6ff',
      color: '#2563eb',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      flex: isSmallScreen ? 1 : 'initial',
      minWidth: isSmallScreen ? 180 : 'auto',
      width: isMobile ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    tabBtnActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      border: 'none',
      outline: 'none',
      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 18,
      display: 'flex',
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
      color: '#2563eb',
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
    },

    tableHeaderRow: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      flexDirection: isSmallScreen ? 'column' : 'row',
      marginBottom: 16,
    },

    tableTitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      color: '#0f172a',
      margin: 0,
    },

    tableSubtitle: {
      marginTop: 3,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    stockSummaryBtn: {
      height: 40,
      padding: '0 15px',
      border: 'none',
      outline: 'none',
      borderRadius: 12,
      background: '#eff6ff',
      color: '#2563eb',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      fontWeight: 800,
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 18px rgba(37, 99, 235, 0.12)',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    inventoryTable: {
      width: '100%',
      borderCollapse: 'collapse',
    },

    tableHead: {
      padding: '12px 11px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      color: '#64748b',
      fontWeight: 700,
      background: '#f8fafc',
      whiteSpace: 'nowrap',
    },

    tableCell: {
      padding: '12px 11px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      color: '#334155',
      whiteSpace: 'nowrap',
    },

    tableRow: {
      background: '#ffffff',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 50,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    statusBadgeGreen: {
      background: '#dcfce7',
      color: '#166534',
    },

    statusBadgeYellow: {
      background: '#fef3c7',
      color: '#92400e',
    },

    statusBadgeRed: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    statusBadgeBlue: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 22,
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
      background: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: isMobile ? 14 : 20,
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
      borderRadius: 12,
      padding: 12,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: 15,
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

    stockSummaryModalContent: {
      width: isMobile ? '100%' : '92%',
      maxWidth: 1120,
      maxHeight: '88vh',
      overflow: 'hidden',
      background: '#ffffff',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    },

    stockSummaryModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: 14,
    },

    stockSummaryModalTitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 20 : 22,
      color: '#0f172a',
      margin: 0,
    },

    stockSummaryModalText: {
      marginTop: 4,
      marginBottom: 0,
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    stockSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? 'repeat(2, minmax(0, 1fr))'
        : 'repeat(4, minmax(0, 1fr))',
      gap: 10,
      marginBottom: 12,
    },

    stockMetricCard: {
      minHeight: isMobile ? 78 : 86,
      borderRadius: 15,
      border: '1px solid #e5e7eb',
      padding: isMobile ? '12px 10px' : '14px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      boxSizing: 'border-box',
    },

    stockMetricBlue: {
      background: '#f8fbff',
      borderColor: '#dbeafe',
    },

    stockMetricGreen: {
      background: '#f6fdf9',
      borderColor: '#d1fae5',
    },

    stockMetricOrange: {
      background: '#fffaf5',
      borderColor: '#fed7aa',
    },

    stockMetricRed: {
      background: '#fff7f7',
      borderColor: '#fecaca',
    },

    stockMetricLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#475569',
      marginBottom: 6,
      fontFamily: 'Arial, sans-serif',
    },

    stockMetricValue: {
      fontSize: isMobile ? 27 : 32,
      fontWeight: 800,
      lineHeight: 1,
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryCard: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexDirection: isSmallScreen ? 'column' : 'row',
      border: '1px solid #edf0f5',
      borderRadius: 15,
      padding: isMobile ? 12 : 14,
      marginBottom: 12,
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    stockCategoryTitle: {
      margin: 0,
      fontSize: 15,
      fontWeight: 800,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryText: {
      margin: '4px 0 0',
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryTabs: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      overflow: 'hidden',
      minWidth: isSmallScreen ? '100%' : 480,
      background: '#ffffff',
    },

    stockCategoryTab: {
      minHeight: 39,
      border: 'none',
      borderRight: isMobile ? 'none' : '1px solid #edf0f5',
      borderBottom: isMobile ? '1px solid #edf0f5' : 'none',
      background: '#ffffff',
      color: '#334155',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryTabActive: {
      background: '#eef4ff',
      color: '#1d4ed8',
      boxShadow: 'inset 0 0 0 1px #93c5fd',
    },

    stockSummaryTableWrapper: {
      width: '100%',
      overflowX: 'auto',
      overflowY: 'auto',
      maxHeight: isMobile ? '45vh' : '46vh',
      border: '1px solid #edf0f5',
      borderRadius: 14,
    },

    editBtn: {
      border: 'none',
      outline: 'none',
      borderRadius: 10,
      padding: '8px 12px',
      background: '#eff6ff',
      color: '#2563eb',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      fontWeight: 700,
    },

    editModalContent: {
      width: isMobile ? '100%' : 560,
      maxWidth: 560,
      background: '#ffffff',
      borderRadius: 22,
      padding: isMobile ? 22 : 28,
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    editModalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 18,
    },

    closeBtn: {
      width: 34,
      height: 34,
      border: 'none',
      outline: 'none',
      borderRadius: 10,
      background: '#f1f5f9',
      color: '#334155',
      cursor: 'pointer',
      fontSize: 22,
      lineHeight: 1,
      flexShrink: 0,
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
      marginBottom: 14,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
    },

    formLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    formInput: {
      height: 42,
      border: '1px solid #dbe3ef',
      outline: 'none',
      borderRadius: 12,
      padding: '0 12px',
      fontSize: 14,
      color: '#172033',
      fontFamily: 'Arial, sans-serif',
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    helperText: {
      marginTop: 2,
      marginBottom: 16,
      padding: 12,
      borderRadius: 12,
      background: '#eff6ff',
      color: '#2563eb',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    editModalActions: {
      display: 'flex',
      gap: 12,
      justifyContent: 'flex-end',
      flexDirection: isMobile ? 'column' : 'row',
      marginTop: 20,
    },

    saveBtn: {
      border: 'none',
      outline: 'none',
      borderRadius: 12,
      padding: '12px 16px',
      background: '#2563eb',
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
    },

    archiveBtn: {
      border: 'none',
      outline: 'none',
      borderRadius: 12,
      padding: '12px 16px',
      background: '#dbeafe',
      color: '#2563eb',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
    },

    cancelEditBtn: {
      border: 'none',
      outline: 'none',
      borderRadius: 12,
      padding: '12px 16px',
      background: '#f1f5f9',
      color: '#334155',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
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

export default createInventoryPageStyles;
