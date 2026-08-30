export default function createInventoryPageStyles({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
  desktopSidebarWidth = 230,
} = {}) {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : desktopSidebarWidth;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      background: '#f5f7fb',
      fontFamily: '"Outfit", Arial, sans-serif',
      color: '#172033',
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
      overflowX: 'hidden',
    },

    logo: {
      textAlign: 'center',
      paddingBottom: isMobile || isTablet ? 18 : 22,
      marginBottom: isMobile || isTablet ? 12 : 14,
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
      gap: 8,
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
      width: '100%',
      minWidth: 0,
    },

    menuItemIcon: {
      marginRight: isMobile || isTablet ? 0 : 12,
      fontSize: 18,
      verticalAlign: 'middle',
      flexShrink: 0,
    },

    menuItemText: {
      display: isMobile || isTablet ? 'none' : 'inline',
      fontSize: 15,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.15,
    },

    menuItemActive: {
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(212, 175, 55, 0.24)',
    },

    notificationBadge: {
      marginLeft: 'auto',
      minWidth: 22,
      height: 22,
      padding: '0 7px',
      borderRadius: 999,
      background: '#dc2626',
      color: '#ffffff',
      display: isMobile || isTablet ? 'none' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      boxSizing: 'border-box',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isMobile || isTablet ? 14 : 18,
      borderTop: '1px solid #e5e7eb',
    },

    dropdownDivider: {
      display: 'none',
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
      padding: isMobile ? '0 12px' : isTablet ? '0 18px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: '100%',
      minWidth: 0,
    },

    adminProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: isMobile ? '0 10px' : '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      minWidth: 0,
      color: '#0f172a',
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
      flexShrink: 0,
    },

    avatarIcon: {
      fontSize: 18,
    },

    adminInfo: {
      display: isMobile ? 'none' : 'block',
      minWidth: 0,
    },

    adminName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
      whiteSpace: 'nowrap',
    },

    adminPosition: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
      whiteSpace: 'nowrap',
    },

    mainContent: {
      padding: isMobile
        ? '88px 12px 18px'
        : isTablet
          ? '96px 18px 22px'
          : isSmallScreen
            ? '98px 20px 24px'
            : '104px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    heroSection: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 165 : isTablet ? 190 : 225,
      borderRadius: isMobile ? 20 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 18 : isTablet ? 22 : 30,
      marginBottom: isMobile ? 16 : 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 20,
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'left',
      boxSizing: 'border-box',
      boxShadow: '0 18px 40px rgba(185, 140, 20, 0.22)',
    },

    heroContent: {
      minWidth: 0,
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
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      marginBottom: 0,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
    },

    heroIconBox: {
      width: isMobile ? 68 : isTablet ? 78 : 90,
      height: isMobile ? 68 : isTablet ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: isMobile ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIcon: {
      fontSize: isMobile ? 32 : isTablet ? 36 : 42,
      color: '#ffffff',
    },

    tabCard: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: 6,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      marginBottom: 18,
      width: isSmallScreen ? '100%' : 'fit-content',
      overflowX: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    tabBtn: {
      height: 42,
      padding: '0 18px',
      border: 'none',
      borderRadius: 12,
      background: 'transparent',
      color: '#64748b',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tabBtnActive: {
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 8px 18px rgba(212, 175, 55, 0.28)',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 20,
      padding: isMobile ? 14 : 16,
      marginBottom: 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
    },

    searchFilterRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
      flexDirection: isSmallScreen ? 'column' : 'row',
      width: '100%',
      minWidth: 0,
    },

    inventoryFilterControls: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'minmax(150px, 190px) minmax(145px, 170px) minmax(145px, 170px)',
      gap: 12,
      alignItems: 'end',
      width: isSmallScreen ? '100%' : 'auto',
      minWidth: 0,
    },

    inventoryFilterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      width: '100%',
    },

    inventoryFilterLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#1e3a8a',
      fontFamily: 'Arial, sans-serif',
    },

    inventoryFilterSelect: {
      width: '100%',
      height: 44,
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

    inventoryFilterInput: {
      width: '100%',
      height: 44,
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

    searchBox: {
      width: isSmallScreen ? '100%' : 420,
      minWidth: 0,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 14px',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#d4af37',
      fontSize: 16,
      flexShrink: 0,
    },

    searchInput: {
      width: '100%',
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      minWidth: 0,
    },

    stockFilterBox: {
      width: isSmallScreen ? '100%' : 220,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#f8fafc',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 14px',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    stockFilterIcon: {
      color: '#d4af37',
      fontSize: 16,
      flexShrink: 0,
    },

    stockFilterSelect: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      cursor: 'pointer',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 14 : isTablet ? 18 : 22,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
    },

    tableHeaderRow: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      flexDirection: isSmallScreen ? 'column' : 'row',
      marginBottom: 18,
      width: '100%',
      minWidth: 0,
    },

    tableTitle: {
      fontSize: isMobile ? 17 : 18,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.25,
    },

    tableSubtitle: {
      fontSize: 13,
      color: '#64748b',
      marginTop: 4,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.45,
    },

    tableWrapper: {
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      boxSizing: 'border-box',
      borderRadius: 16,
      border: '1px solid #edf0f5',
    },

    inventoryTable: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#ffffff',
    },

    tableHead: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: 13,
      color: '#334155',
      fontWeight: 800,
      background: '#f8fafc',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      background: '#ffffff',
      transition: '0.2s ease',
    },

    tableCell: {
      padding: '14px 12px',
      textAlign: 'left',
      borderBottom: '1px solid #edf0f5',
      fontSize: 13,
      color: '#334155',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
      verticalAlign: 'middle',
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 24,
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      borderBottom: '1px solid #edf0f5',
    },

    editBtn: {
      minWidth: 74,
      height: 36,
      border: '1px solid #f3d46b',
      borderRadius: 12,
      background: '#fff8e1',
      color: '#b8860b',
      padding: '0 14px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      fontWeight: 800,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    tableHeaderRow: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: 16,
      marginBottom: 18,
      width: '100%',
      minWidth: 0,
    },

    tableActionGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isSmallScreen ? 'stretch' : 'flex-end',
      gap: isMobile ? 10 : 14,
      flexWrap: 'wrap',
      width: isSmallScreen ? '100%' : 'auto',
    },

    tableButtonGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isSmallScreen ? 'stretch' : 'flex-end',
      gap: isMobile ? 10 : 14,
      flexWrap: 'wrap',
      width: isSmallScreen ? '100%' : 'auto',
    },

    stockSummaryBtn: {
      minHeight: 42,
      padding: '0 14px',
      border: '1px solid #d4af37',
      borderRadius: 14,
      background: '#fff8e1',
      color: '#b8860b',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      whiteSpace: 'nowrap',
    },

    stockSummaryBtnActive: {
      background: '#d4af37',
      color: '#ffffff',
      borderColor: '#d4af37',
      boxShadow: '0 12px 24px rgba(212, 175, 55, 0.28)',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    statusBadgeGreen: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusBadgeYellow: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusBadgeRed: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    statusBadgeBlue: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    pagination: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-end',
      gap: 12,
      marginTop: 20,
      flexWrap: 'nowrap',
    },

    pageBtn: {
      minWidth: 100,
      height: 40,
      padding: '0 18px',
      borderRadius: 10,
      border: '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: '0.2s ease',
    },

    prevPageBtn: {
      background: '#ffffff',
      color: '#b8860b',
      border: '1px solid #d4af37',
    },

    nextPageBtn: {
      background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
      color: '#ffffff',
    },

    pageBtnDisabled: {
      background: '#f8fafc',
      color: '#94a3b8',
      border: '1px solid #e2e8f0',
      cursor: 'not-allowed',
    },

    pageInfo: {
      minWidth: 100,
      height: 40,
      padding: '0 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      color: '#334155',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    modal: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 18 : 20,
      boxSizing: 'border-box',
    },

    modalContent: {
      width: isMobile ? '100%' : 390,
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 22,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.25)',
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

    editModalContent: {
      width: isMobile ? '100%' : 760,
      maxWidth: 760,
      maxHeight: '90vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 18 : 24,
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    editModalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 18,
    },

    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      color: '#334155',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
      width: '100%',
      minWidth: 0,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      minWidth: 0,
    },

    formLabel: {
      fontSize: 13,
      fontWeight: 800,
      color: '#1e3a8a',
      fontFamily: 'Arial, sans-serif',
    },

    formInput: {
      width: '100%',
      height: 42,
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      background: '#ffffff',
      padding: '0 12px',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    helperText: {
      margin: '14px 0 0',
      padding: 12,
      borderRadius: 12,
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    editModalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 20,
      flexDirection: isMobile ? 'column' : 'row',
    },

    saveBtn: {
      height: 40,
      border: 'none',
      borderRadius: 10,
      background: '#d4af37',
      color: '#ffffff',
      padding: '0 18px',
      fontWeight: 800,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    cancelEditBtn: {
      height: 40,
      border: 'none',
      borderRadius: 10,
      background: '#f1f5f9',
      color: '#334155',
      padding: '0 18px',
      fontWeight: 800,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    stockSummaryModalContent: {
      width: isMobile ? '100%' : 'min(1120px, 94vw)',
      maxWidth: '94vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 18 : 24,
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    },

    stockSummaryModalHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 18,
    },

    stockSummaryModalTitle: {
      margin: 0,
      fontSize: isMobile ? 19 : 22,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    stockSummaryModalText: {
      margin: '5px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    stockSummaryGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isSmallScreen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
      gap: 12,
      marginBottom: 16,
    },

    stockMetricCard: {
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: 16,
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    stockMetricClickable: {
      cursor: 'pointer',
    },

    stockMetricSelected: {
      outline: '2px solid #d4af37',
      outlineOffset: 0,
    },

    stockMetricBlue: {
      background: '#eff6ff',
    },

    stockMetricGreen: {
      background: '#f0fdf4',
    },

    stockMetricOrange: {
      background: '#fff7ed',
    },

    stockMetricRed: {
      background: '#fef2f2',
    },

    stockMetricLabel: {
      display: 'block',
      color: '#64748b',
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 8,
      fontFamily: 'Arial, sans-serif',
    },

    stockMetricValue: {
      fontSize: 28,
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryCard: {
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      background: '#f8fafc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 12,
      boxSizing: 'border-box',
    },

    stockCategoryTitle: {
      margin: 0,
      fontSize: 15,
      color: '#0f172a',
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryText: {
      margin: '4px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryTabs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },

    stockCategoryTab: {
      height: 32,
      border: 'none',
      borderRadius: 12,
      background: '#fff8e1',
      color: '#b8860b',
      padding: '0 14px',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },

    stockCategoryTabActive: {
      background: '#d4af37',
      borderColor: 'transparent',
      color: '#ffffff',
    },

    stockSummaryTableWrapper: {
      width: '100%',
      overflowX: 'auto',
      border: '1px solid #edf0f5',
      borderRadius: 16,
      boxSizing: 'border-box',
    },
  };
}
