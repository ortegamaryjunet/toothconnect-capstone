const createAdminReportsStyles = ({
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
      width: isMobile ? 52 : isTablet ? 58 : 125,
      height: 'auto',
      maxWidth: '100%',
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
      justifyContent: isMobile || isTablet ? 'center' : 'flex-start',
      gap: isMobile || isTablet ? 0 : 12,
      padding: isMobile || isTablet ? '13px 0' : '13px 14px',
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
      fontSize: 18,
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
      background: '#d4af37',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatarIcon: {
      fontSize: 18,
    },

    adminInfo: {
      display: isMobile ? 'none' : 'block',
      textAlign: 'left',
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
      padding: isMobile ? '96px 14px 20px' : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
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
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 600,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 23 : 31,
      lineHeight: 1.2,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
    },

    heroIconBox: {
      width: isMobile ? 70 : 90,
      height: isMobile ? 70 : 90,
      minWidth: isMobile ? 70 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIcon: {
      fontSize: isMobile ? 32 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
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
      padding: '0 36px 0 14px',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23334155' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
      cursor: 'pointer',
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

    filterActionGroup: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
      width: isSmallScreen ? '100%' : 'auto',
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

    exportBtn: {
      height: 48,
      minWidth: isSmallScreen ? '100%' : 110,
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
      transition: '0.2s ease',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    exportCsv: {
      background: 'linear-gradient(135deg, #15803d, #22c55e)',
      boxShadow: '0 8px 18px rgba(34, 197, 94, 0.24)',
    },

    exportPdf: {
      background: 'linear-gradient(135deg, #991b1b, #dc2626)',
      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.24)',
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
      background: "#DCFCE7",
      color: "#15803D",
    },

    statusInfo: {
      background: "#DBEAFE",
      color: "#2563EB",
    },

    statusWarning: {
      background: "#FEF3C7",
      color: "#B45309",
    },

    statusDanger: {
      background: "#FEE2E2",
      color: "#DC2626",
    },

    statusPurple: {
      background: "#F3E8FF",
      color: "#7E22CE",
    },

    statusGray: {
      background: "#F3F4F6",
      color: "#4B5563",
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
      display: "flex",
      alignItems: "center",
      justifyContent: isMobile ? "center" : "flex-end",
      gap: 12,
      marginTop: 20,
      flexWrap: "nowrap",
    },

    pageBtn: {
      minWidth: 100,
      height: 40,
      padding: "0 18px",
      borderRadius: 10,
      border: "1px solid transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "Arial, sans-serif",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "0.2s ease",
    },

    prevPageBtn: {
      background: "#ffffff",
      color: "#b8860b",
      border: "1px solid #d4af37",
    },

    nextPageBtn: {
      background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
      color: "#ffffff",
    },

    pageBtnDisabled: {
      background: "#f8fafc",
      color: "#94a3b8",
      border: "1px solid #e2e8f0",
      cursor: "not-allowed",
    },

    pageInfo: {
      minWidth: 100,
      height: 40,
      padding: "0 18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      color: "#334155",
      fontSize: 13,
      fontWeight: 700,
      fontFamily: "Arial, sans-serif",
      whiteSpace: "nowrap",
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

    saveExpenseModalBtn: {
      background: '#16a34a',
      color: '#ffffff',
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
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 24 : 28,
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

    interpretationCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      marginBottom: 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    interpretationHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
      gap: 12,
    },

    interpretationTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: isMobile ? 17 : 18,
      fontFamily: 'Arial, sans-serif',
    },

    interpretationSubtitle: {
      margin: '4px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.45,
      fontFamily: 'Arial, sans-serif',
    },

    interpretationGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(3, minmax(0, 1fr))',
      gap: 12,
      width: '100%',
      minWidth: 0,
    },

    interpretationItem: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 14,
      boxSizing: 'border-box',
      minWidth: 0,
    },

    interpretationItemTitle: {
      margin: '0 0 6px',
      color: '#1e3a8a',
      fontSize: 13,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    interpretationItemText: {
      margin: 0,
      color: '#475569',
      fontSize: 13,
      lineHeight: 1.55,
      fontFamily: 'Arial, sans-serif',
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

    revenueContent: {
      width: '100%',
      boxSizing: 'border-box',
    },

    revenueLayout: {
      display: 'grid',
      gridTemplateColumns: '1fr',
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

    revenueFormulaTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: 23,
      fontFamily: 'Arial, sans-serif',
    },

    revenueFormulaText: {
      margin: 0,
      color: '#334155',
      fontSize: 19,
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
