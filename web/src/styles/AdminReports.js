const createAdminReportsStyles = ({
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
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : 200,
      borderRadius: isMobile ? 22 : 24,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 24 : 30,
      marginBottom: 20,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      position: 'relative',
      zIndex: 2,
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
      width: isMobile ? 74 : 95,
      height: isMobile ? 74 : 95,
      minWidth: isMobile ? 74 : 95,
      borderRadius: isMobile ? 20 : 24,
      background: 'rgba(255, 255, 255, 0.15)',
      display: isSmallScreen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIcon: {
      fontSize: 42,
      color: '#ffffff',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      marginBottom: 20,
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: isSmallScreen ? 'initial' : 1,
      width: isSmallScreen ? '100%' : 'auto',
    },

    reportTypeGroup: {
      flex: isSmallScreen ? 'initial' : 2,
    },

    filterLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#1e3a8a',
      fontFamily: 'Arial, sans-serif',
    },

    filterSelect: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      padding: '0 14px',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    filterInput: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      padding: '0 14px',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    filterBtn: {
      height: 48,
      minWidth: isSmallScreen ? '100%' : 140,
      border: 'none',
      borderRadius: 14,
      padding: '0 18px',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.18)',
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? 'repeat(2, 1fr)'
          : 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 20,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    summaryIconText: {
      fontSize: 22,
    },

    summaryText: {
      minWidth: 0,
    },

    summaryIconBlue: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    summaryIconGreen: {
      background: '#dcfce7',
      color: '#15803d',
    },

    summaryIconYellow: {
      background: '#fef3c7',
      color: '#b45309',
    },

    summaryIconRed: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    summaryLabel: {
      margin: 0,
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    summaryValue: {
      margin: '4px 0 0',
      color: '#0f172a',
      fontSize: 26,
      fontFamily: 'Arial, sans-serif',
    },

    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '2fr 1fr',
      gap: 20,
      marginBottom: 20,
    },

    reportCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    chartLarge: {
      minHeight: 360,
    },

    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 12,
    },

    cardTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: 18,
      fontFamily: 'Arial, sans-serif',
    },

    cardSubtitle: {
      margin: '4px 0 0',
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    chartBox: {
      height: isMobile ? 260 : 300,
      width: '100%',
    },

    smallChart: {
      height: isMobile ? 240 : 300,
      width: '100%',
    },

    tableCard: {
      marginBottom: 0,
    },

    tableHeader: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 18,
      flexDirection: isSmallScreen ? 'column' : 'row',
    },

    tableActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
      width: isSmallScreen ? '100%' : 'auto',
      flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
    },

    tableSearch: {
      width: isSmallScreen ? '100%' : 260,
      height: 43,
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
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

    exportBtn: {
      height: 43,
      border: 'none',
      borderRadius: 14,
      padding: '0 14px',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
      minWidth: 82,
    },

    exportCsv: {
      background: '#16a34a',
    },

    exportPdf: {
      background: '#dc2626',
    },

    tableContainer: {
      width: '100%',
      overflowX: 'auto',
    },

    reportsTable: {
      width: '100%',
      minWidth: 950,
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

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    statusSuccess: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusWarning: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusFailed: {
      background: '#fee2e2',
      color: '#dc2626',
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

    expenseModalContent: {
      maxWidth: 460,
      textAlign: 'center',
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

    expenseModalIcon: {
      background: '#dcfce7',
      color: '#16a34a',
      marginLeft: 'auto',
      marginRight: 'auto',
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
      textAlign: 'center',
    },

    expenseOverview: {
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 20,
      background: '#ffffff',
    },

    expenseOverviewRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 16,
      padding: '12px 14px',
      borderBottom: '1px solid #e5e7eb',
      alignItems: 'flex-start',
    },

    expenseOverviewLabel: {
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    expenseOverviewValue: {
      color: '#0f172a',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      textAlign: 'right',
      wordBreak: 'break-word',
    },

    expenseOverviewTotalRow: {
      borderBottom: 'none',
      background: '#f8fafc',
      alignItems: 'center',
    },

    expenseOverviewTotalLabel: {
      color: '#0f172a',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    expenseOverviewTotalValue: {
      color: '#16a34a',
      fontSize: 17,
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
      fontWeight: 'bold'
    },

    saveExpenseModalBtn: {
      background: '#16a34a',
      color: '#ffffff',
      fontWeight: 'bold',
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
    revenueContent: {
      width: '100%',
      boxSizing: 'border-box',
    },

    revenueLayout: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 340px',
      gap: 20,
      alignItems: 'start',
    },

    revenueLeftContent: {
      minWidth: 0,
      width: '100%',
    },

    revenueSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet
          ? 'repeat(2, 1fr)'
          : 'repeat(3, 1fr)',
      gap: 16,
      marginBottom: 20,
    },

    revenueSummaryAmount: {
      fontSize: isMobile ? 20 : 22,
      lineHeight: 1.2,
      overflowWrap: 'anywhere',
    },

    revenueMiddleGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1.7fr 0.9fr',
      gap: 20,
      marginBottom: 20,
    },

    revenueChartBox: {
      height: isMobile ? 280 : 320,
      width: '100%',
    },

    revenueFormulaItem: {
      padding: '14px 0',
      borderBottom: '1px solid #e5e7eb',
    },

    revenueFormulaText: {
      margin: 0,
      color: '#334155',
      fontSize: 14,
      lineHeight: 1.55,
      fontFamily: 'Arial, sans-serif',
    },

    revenueIncomeText: {
      color: '#0f172a',
      fontWeight: 700,
    },

    revenueExpenseText: {
      color: '#0f172a',
      fontWeight: 700,
    },

    revenueBlueText: {
      color: '#0f172a',
      fontWeight: 700,
    },

    revenueSummaryTable: {
      width: '100%',
      minWidth: 620,
      borderCollapse: 'collapse',
    },

    revenueTableHead: {
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

    revenueTableCell: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      whiteSpace: 'nowrap',
    },

    revenueCell: {
      color: '#334155',
      fontWeight: 700,
    },

    revenueTotalCell: {
      fontWeight: 700,
      color: '#0f172a',
      background: '#f8fafc',
    },

    revenueTotalIncomeCell: {
      fontWeight: 700,
      color: '#0f172a',
      background: '#f8fafc',
    },

    revenueTotalExpenseCell: {
      fontWeight: 700,
      color: '#0f172a',
      background: '#f8fafc',
    },

    revenueTotalRevenueCell: {
      fontWeight: 700,
      color: '#0f172a',
      background: '#f8fafc',
    },

    expensePanel: {
      position: isSmallScreen ? 'static' : 'sticky',
      top: 20,
    },

    expensePanelHeader: {
      marginBottom: 16,
    },

    revenueFormGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '0 20px',
      marginTop: 16,
      boxSizing: 'border-box',
    },

    revenueFormLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#1e3a8a',
      fontFamily: 'Arial, sans-serif',
    },

    revenueFormInput: {
      width: '100%',
      height: 45,
      borderRadius: 13,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      padding: '0 13px',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    totalExpenseBox: {
      margin: '18px 20px 16px',
      padding: 16,
      borderRadius: 16,
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
    },

    totalExpenseLabel: {
      margin: 0,
      color: '#64748b',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    totalExpenseValue: {
      margin: '8px 0 0',
      color: '#0f172a',
      fontSize: 18,
      lineHeight: 1.35,
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
    },

    saveExpenseBtn: {
      width: 'calc(100% - 40px)',
      height: 48,
      margin: '0 20px 16px',
      border: 'none',
      borderRadius: 14,
      background: '#2563eb',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.18)',
    },

    expenseNote: {
      minHeight: 50,
      margin: '0 20px 20px',
      padding: '14px 16px',
      borderRadius: 12,
      background: '#eff6ff',
      color: '#334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },
  };
};

export default createAdminReportsStyles;
