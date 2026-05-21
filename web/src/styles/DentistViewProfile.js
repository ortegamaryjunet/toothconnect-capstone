const createDentistViewProfileStyles = ({
  isMobile = false,
  isSmallScreen = false,
} = {}) => {
  const topHeaderHeight = isMobile ? 68 : 72;
  const sidebarWidth = isMobile ? 82 : 245;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#f5f7fb',
      fontFamily: 'Arial, sans-serif',
      color: '#172033',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },

    topHeader: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: topHeaderHeight,
      width: '100%',
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 10 : 18,
      padding: isMobile ? '0 16px' : '0 24px',
      zIndex: 1000,
      boxSizing: 'border-box',
    },

    backLink: {
      height: 42,
      padding: isMobile ? '0 12px' : '0 14px',
      borderRadius: 14,
      background: '#eff6ff',
      color: '#2563eb',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    headerTitle: {
      margin: 0,
      fontSize: isMobile ? 17 : 20,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    sidebar: {
      position: 'fixed',
      top: topHeaderHeight,
      left: 0,
      bottom: 0,
      width: sidebarWidth,
      background: '#ffffff',
      borderRight: '1px solid #e5e7eb',
      padding: isMobile ? '16px 10px' : '18px 14px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      zIndex: 500,
    },

    menuItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: isMobile ? 0 : 12,
      padding: isMobile ? '14px 10px' : '14px 15px',
      marginBottom: 10,
      borderRadius: 14,
      cursor: 'pointer',
      color: '#475569',
      fontSize: 15,
      transition: '0.2s ease',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.24)',
    },

    menuItemIcon: {
      fontSize: isMobile ? 20 : 18,
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
    },

    mainContainer: {
      position: 'fixed',
      top: topHeaderHeight,
      left: sidebarWidth,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#f5f7fb',
      padding: isMobile ? 18 : 28,
      boxSizing: 'border-box',
    },

    errorBox: {
      color: '#b91c1c',
      marginBottom: 14,
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
    },

    loadingBox: {
      color: '#64748b',
      marginBottom: 14,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
    },

    sectionBanner: {
      background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
      color: '#ffffff',
      padding: isMobile ? 24 : '28px 30px',
      borderRadius: isMobile ? 22 : 24,
      marginBottom: 22,
      boxShadow: '0 18px 40px rgba(37, 99, 235, 0.18)',
    },

    sectionBannerTitle: {
      margin: 0,
      fontSize: isMobile ? 23 : 28,
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    },

    sectionBannerText: {
      margin: '8px 0 0',
      fontSize: 14,
      color: '#ffffff',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    patientCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 22,
      padding: 24,
      marginBottom: 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 18,
      boxSizing: 'border-box',
    },

    patientAvatar: {
      width: 78,
      height: 78,
      borderRadius: 18,
      background: '#eff6ff',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 36,
      flexShrink: 0,
    },

    patientName: {
      margin: '0 0 6px',
      fontSize: 24,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    patientNumber: {
      margin: 0,
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    infoCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 22,
      padding: 24,
      marginBottom: 20,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    infoCardTitle: {
      margin: '0 0 18px',
      fontSize: 18,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    subHeading: {
      margin: '18px 0 12px',
      fontSize: 13,
      color: '#2563eb',
      textTransform: 'uppercase',
      fontFamily: 'Arial, sans-serif',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)',
      gap: 16,
    },

    infoBox: {
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 18,
      minHeight: 78,
      boxSizing: 'border-box',
    },

    infoBoxFull: {
      gridColumn: isSmallScreen ? 'auto' : '1 / -1',
    },

    infoLabel: {
      display: 'block',
      fontSize: 12,
      color: '#64748b',
      marginBottom: 8,
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      display: 'block',
      fontSize: 15,
      color: '#0f172a',
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
    },

    emptyBox: {
      padding: 18,
      borderRadius: 16,
      background: '#f8fafc',
      border: '1px dashed #cbd5e1',
      color: '#64748b',
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },

    conditionList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
    },

    conditionChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRadius: 999,
      background: '#eff6ff',
      color: '#2563eb',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 20,
      padding: 18,
      marginBottom: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1.5fr 220px 220px',
      gap: 14,
      boxSizing: 'border-box',
    },

    searchBox: {
      height: 46,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: '0 14px',
      background: '#f8fafc',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#64748b',
      fontSize: 16,
    },

    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: 14,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    filterSelect: {
      height: 46,
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: '0 14px',
      background: '#f8fafc',
      color: '#0f172a',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 22,
      padding: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
      borderRadius: 16,
      border: '1px solid #e5e7eb',
    },

    dataTable: {
      width: '100%',
      minWidth: 900,
      borderCollapse: 'collapse',
      background: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    },

    tableHead: {
      background: '#f8fafc',
      color: '#475569',
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'left',
      padding: '14px 16px',
      borderBottom: '1px solid #e5e7eb',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      borderBottom: '1px solid #edf0f5',
    },

    tableCell: {
      padding: '15px 16px',
      fontSize: 14,
      color: '#172033',
      verticalAlign: 'top',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    emptyRow: {
      padding: 28,
      textAlign: 'center',
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 88,
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    statusCompleted: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusOngoing: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusCancelled: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 16,
      fontFamily: 'Arial, sans-serif',
    },

    pageBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      color: '#2563eb',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    pageBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
      color: '#94a3b8',
    },

    pageInfo: {
      fontSize: 13,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
    },
  };
};

export default createDentistViewProfileStyles;