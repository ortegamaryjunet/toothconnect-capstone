const createAdminTransactionsStyles = ({
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
      paddingBottom: 22,
      marginBottom: 14,
      borderBottom: '1px solid #e5e7eb',
    },

    logoImg: {
      width: isMobile ? 55 : 125,
      height: 'auto',
      maxWidth: '100%',
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
      padding: isMobile ? '92px 14px 20px' : '104px 28px 28px',
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
      gap: isMobile ? 18 : 24,
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'left',
      boxSizing: 'border-box',
      boxShadow: '0 18px 40px rgba(185, 140, 20, 0.22)',
    },

    heroContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: isSmallScreen ? 620 : 760,
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
      fontFamily: '"Outfit", Arial, sans-serif',
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 23 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
      fontFamily: '"Outfit", Arial, sans-serif',
      fontWeight: 800,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
      marginBottom: 0,
      fontFamily: '"Outfit", Arial, sans-serif',
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

    titleRow: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 16,
      flexDirection: isMobile ? 'column' : 'row',
    },

    pageTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: isMobile ? 24 : 30,
      fontWeight: 800,
    },

    pdfBtn: {
      height: 43,
      minWidth: isMobile ? '100%' : 110,
      border: 'none',
      borderRadius: 14,
      background: 'linear-gradient(135deg, #f87171, #dc2626)',
      color: '#ffffff',
      padding: '0 18px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 700,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      cursor: 'pointer',
      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.24)',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    filters: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, 1fr)'
          : 'repeat(4, minmax(160px, 1fr)) auto',
      gap: 10,
      marginBottom: 20,
      boxSizing: 'border-box',
    },

    filterSelect: {
      height: 43,
      width: '100%',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      background: '#ffffff',
      color: '#334155',
      padding: '0 36px 0 14px',
      outline: 'none',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23111827' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
      cursor: 'pointer',
    },

    sourceFilter: {
      gridColumn: 'auto',
    },

    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? 'repeat(2, 1fr)'
          : 'repeat(4, 1fr)',
      gap: isMobile ? 14 : 18,
      marginBottom: 22,
    },

    summaryCard: {
      background: '#ffffff',
      border: 'none',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      minHeight: isMobile ? 92 : 104,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.03)',
      boxSizing: 'border-box',
    },

    summaryLabel: {
      margin: 0,
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.25,
      fontFamily: 'Arial, sans-serif',
    },

    summaryValue: {
      margin: '8px 0 0',
      color: '#0f172a',
      fontSize: isMobile ? 24 : 27,
      fontWeight: 700,
      lineHeight: 1.1,
      fontFamily: 'Arial, sans-serif',
    },

    tableWrap: {
      width: '100%',
      overflowX: 'hidden',
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
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

    table: {
      width: '100%',
      minWidth: 1040,
      borderCollapse: 'collapse',
    },

    tableHead: {
      textAlign: 'left',
      padding: '14px 12px',
      color: '#64748b',
      background: '#f8fafc',
      borderBottom: '1px solid #edf0f5',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    tableCell: {
      padding: '14px 12px',
      borderBottom: '1px solid #edf0f5',
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    tableCellStrong: {
      fontWeight: 700,
      color: '#0f172a',
    },

    emptyCell: {
      padding: 28,
      textAlign: 'center',
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 44,
      padding: '5px 9px',
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    badgePaid: {
      background: '#ECFDF5',
      color: '#059669',
    },

    badgePending: {
      background: '#FFF7ED',
      color: '#D97706',
    },

    badgeRejected: {
      background: '#FEF2F2',
      color: '#DC2626',
    },

    badgeDefault: {
      background: '#F8FAFC',
      color: '#64748B',
    },

    errorText: {
      margin: '0 0 14px',
      color: '#b91c1c',
      fontSize: 14,
      fontWeight: 700,
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
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.58)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 9999,
    },

    modalBox: {
      width: '100%',
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 18,
      padding: 24,
      textAlign: 'center',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    modalTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: 22,
      fontWeight: 800,
    },

    modalText: {
      margin: '10px 0 20px',
      color: '#64748b',
      lineHeight: 1.5,
    },

    modalButton: {
      height: 44,
      minWidth: 120,
      border: 'none',
      borderRadius: 12,
      background: '#d4af37',
      color: '#ffffff',
      fontWeight: 800,
      cursor: 'pointer',
    },
  };
};

export default createAdminTransactionsStyles;
