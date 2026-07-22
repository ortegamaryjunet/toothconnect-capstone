const createAdminSettingsStyles = ({
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
      outline: 'none',
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
      minHeight: isMobile ? 'auto' : 200,
      marginBottom: 20,
      padding: isMobile ? 24 : 30,
      borderRadius: isMobile ? 22 : 24,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
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
      width: 95,
      height: 95,
      minWidth: 95,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.15)',
      display: isSmallScreen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIcon: {
      fontSize: 42,
      color: '#ffffff',
    },

    settingsTabs: {
      display: 'flex',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 20 : 24,
      padding: isMobile ? 10 : 14,
      marginBottom: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      overflowX: 'auto',
      boxSizing: 'border-box',
    },

    settingsTab: {
      height: isMobile ? 48 : 50,
      padding: isMobile ? '0 16px' : '0 20px',
      borderRadius: 16,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#64748b',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      whiteSpace: 'nowrap',
      transition: '0.2s ease',
      fontSize: isMobile ? 13 : 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    settingsTabActive: {
      background: '#d4af37',
      color: '#ffffff',
      boxShadow: '0 8px 18px rgba(212, 175, 55, 0.28)',
    },

    settingsTabIcon: {
      fontSize: 18,
    },

    toolbar: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      marginBottom: 20,
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 16,
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    searchBox: {
      width: isSmallScreen ? '100%' : 360,
      height: 48,
      padding: '0 15px',
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#8b6508',
      fontSize: 15,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: '#172554',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    rightActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexDirection: isSmallScreen ? 'column' : 'row',
      width: isSmallScreen ? '100%' : 'auto',
    },

    selectInput: {
      height: 48,
      padding: '0 14px',
      borderRadius: 14,
      border: '1px solid #dbe3ef',
      background: '#ffffff',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      width: isSmallScreen ? '100%' : 'auto',
      minWidth: isSmallScreen ? '100%' : 160,
      boxSizing: 'border-box',
    },

    primaryBtn: {
      height: 48,
      border: 'none',
      outline: 'none',
      borderRadius: 14,
      padding: '0 18px',
      backgroundColor: "#2563eb",
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'Arial, sans-serif',
      width: isSmallScreen ? '100%' : 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    leaveRequestActionGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },

    approveBtn: {
      minWidth: 98,
      height: 34,
      border: 'none',
      borderRadius: 999,
      background: '#ecfdf5',
      color: '#047857',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontFamily: 'Arial, sans-serif',
    },

    rejectBtn: {
      minWidth: 98,
      height: 34,
      border: 'none',
      borderRadius: 999,
      background: '#fff1f2',
      color: '#be123c',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontFamily: 'Arial, sans-serif',
    },

    websiteFieldRow: {
      marginBottom: 14,
    },

    websiteFieldLabel: {
      display: 'block',
      fontSize: 13,
      color: "#000000",
      fontWeight: 700,
      marginBottom: 6,
      fontFamily: 'Arial, sans-serif',
    },

    websiteDesignBox: {
      margin: '18px 0',
      padding: isMobile ? 14 : 16,
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      background: '#fffaf0',
      boxSizing: 'border-box',
    },

    websiteDesignTitle: {
      margin: '0 0 14px',
      color: "#000000",
      fontSize: 16,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    websiteTextarea: {
      minHeight: 92,
      resize: 'vertical',
      width: '100%',
      paddingTop: 12,
      lineHeight: 1.5,
      boxSizing: 'border-box',
    },

    websiteAppearanceGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '280px minmax(0, 1fr)',
      gap: 20,
      alignItems: 'start',
    },

    websiteLogoCard: {
      border: '1px solid #e5e7eb',
      borderRadius: 18,
      padding: 16,
      background: '#f8fafc',
      boxSizing: 'border-box',
    },

    websiteLogoPreviewBox: {
      width: '100%',
      minHeight: 180,
      borderRadius: 16,
      border: '1px dashed #d4af37',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      marginBottom: 14,
    },

    websiteLogoPreview: {
      maxWidth: '90%',
      maxHeight: 150,
      objectFit: 'contain',
      display: 'block',
    },

    websiteLogoPlaceholder: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      color: '#94a3b8',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
    },

    websiteLogoPlaceholderIcon: {
      fontSize: 34,
      color: '#d4af37',
    },

    websiteUploadBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },

    fileInput: {
      width: '100%',
      border: '1px solid #dbe3ef',
      borderRadius: 12,
      padding: 10,
      background: '#ffffff',
      color: '#334155',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    websiteUploadHint: {
      margin: 0,
      fontSize: 12,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    websiteAppearanceFields: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      columnGap: 16,
      rowGap: 2,
      minWidth: 0,
    },

    announcementHeader: {
      display: 'flex',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: 18,
    },

    announcementTitleBlock: {
      minWidth: 0,
    },

    announcementTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: isMobile ? 18 : 21,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    announcementSubtitle: {
      margin: '6px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    announcementGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 16,
      marginTop: 14,
    },

    announcementCard: {
      position: 'relative',
      border: '1px solid #eadfbd',
      borderRadius: 18,
      padding: isMobile ? 16 : 18,
      background: 'linear-gradient(180deg, #ffffff 0%, #fffaf0 100%)',
      boxShadow: '0 10px 24px rgba(139, 101, 8, 0.08)',
      boxSizing: 'border-box',
      overflow: 'hidden',
    },

    announcementCard: {
      position: 'relative',
      border: '1px solid #f1e4bf',
      borderRadius: 22,
      padding: 22,
      background: '#ffffff',
      boxShadow: '0 12px 30px rgba(139,101,8,0.08)',
      overflow: 'hidden',
    },

    announcementCardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      marginBottom: 14,
    },

    announcementCardTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: 18,
      fontWeight: 800,
      lineHeight: 1.4,
    },

    announcementCardText: {
      margin: '0 0 18px',
      color: '#475569',
      fontSize: 14,
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap',
    },

    announcementMetaGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      marginTop: 16,
    },

    announcementMetaItem: {
      padding: '12px 14px',
      borderRadius: 14,
      background: '#fffaf0',
      border: '1px solid #f3e5ab',
    },

    announcementActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },

    announcementIconBtn: {
      width: 42,
      height: 42,
      borderRadius: 12,
      border: 'none',
      background: '#fff7e6',
      color: '#8b6508',
      cursor: 'pointer',
    },

    announcementDeleteBtn: {
      width: 42,
      height: 42,
      borderRadius: 12,
      border: 'none',
      background: '#fee2e2',
      color: '#dc2626',
      cursor: 'pointer',
    },

    announcementDateGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    announcementBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    announcementActiveBadge: {
      background: '#dcfce7',
      color: '#15803d',
    },

    announcementScheduledBadge: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    announcementExpiredBadge: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    announcementDraftBadge: {
      background: '#f1f5f9',
      color: '#64748b',
    },

    announcementEmptyBox: {
      width: '100%',
      marginTop: 14,
      padding: isMobile ? 20 : 26,
      borderRadius: 18,
      border: '1px dashed #d4af37',
      background: '#fffaf0',
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      boxSizing: 'border-box',
    },

    announcementEmptyIcon: {
      fontSize: 18,
      color: '#b8860b',
    },

    tableCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : 20,
      overflowX: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    accountCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 18 : 24,
      boxSizing: 'border-box',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
    },

    accountHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 20,
      flexDirection: isMobile ? 'column' : 'row',
    },

    accountTitle: {
      margin: 0,
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    accountSubtitle: {
      margin: '5px 0 0',
      fontSize: 13,
      color: '#64748b',
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    successText: {
      margin: '0 0 16px',
      padding: '12px 14px',
      border: '1px solid #bbf7d0',
      borderRadius: 12,
      background: '#f0fdf4',
      color: '#15803d',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    errorText: {
      margin: '0 0 16px',
      padding: '12px 14px',
      border: '1px solid #fecaca',
      borderRadius: 12,
      background: '#fef2f2',
      color: '#b91c1c',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    accountDetailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 14,
    },

    infoItem: {
      padding: 16,
      borderRadius: 16,
      border: '1px solid #e5e7eb',
      background: '#f8fafc',
      minWidth: 0,
      boxSizing: 'border-box',
    },

    infoLabel: {
      display: 'block',
      marginBottom: 7,
      fontSize: 12,
      fontWeight: 700,
      color: '#8b6508',
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      display: 'block',
      color: '#0f172a',
      fontSize: 15,
      fontWeight: 700,
      overflowWrap: 'anywhere',
      fontFamily: 'Arial, sans-serif',
    },

    tableWrapper: {
      width: '100%',
      overflowX: 'auto',
    },

    branchTable: {
      width: '100%',
      minWidth: 1100,
      borderCollapse: 'collapse',
    },

    tableHead: {
      background: '#f8fafc',
      color: '#64748b',
      fontSize: 13,
      textAlign: 'left',
      padding: 15,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
      borderBottom: '1px solid #edf0f5',
    },

    tableCell: {
      padding: 15,
      borderBottom: '1px solid #edf0f5',
      color: '#334155',
      fontSize: 14,
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    tableRow: {
      background: '#ffffff',
    },

    statusCancelled: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    statusActive: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusInactive: {
      background: '#f1f5f9',
      color: '#64748b',
    },

    statusOpening: {
      background: '#dbeafe',
      color: '#2563eb',
    },

    statusClosed: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    statusRenovation: {
      background: '#fef3c7',
      color: '#b45309',
    },

    editBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      border: 'none',
      outline: 'none',
      background: '#ffffff',
      color: '#8b6508',
      cursor: 'pointer',
      boxShadow: 'inset 0 0 0 1px #eadfbd',
    },

    emptyRow: {
      textAlign: 'center',
      color: '#64748b',
      padding: 30,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
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
      minWidth: 110,
      textAlign: 'center',
      fontSize: 14,
      color: '#475569',
      fontFamily: 'Arial, sans-serif',
    },

    overlay: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.62)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 16 : 22,
      boxSizing: 'border-box',
    },

    overlayContent: {
      width: 760,
      maxWidth: '100%',
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: isMobile ? 22 : 28,
      overflow: 'hidden',
      boxShadow: '0 28px 80px rgba(15, 23, 42, 0.35)',
    },

    overlayHeader: {
      padding: isMobile ? '20px 22px' : '24px 28px',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    overlayTitle: {
      margin: 0,
      fontSize: isMobile ? 19 : 22,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    overlayClose: {
      width: 42,
      height: 42,
      border: 'none',
      outline: 'none',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.18)',
      color: '#ffffff',
      fontSize: 28,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    overlayBody: {
      padding: isMobile ? 18 : 26,
      maxHeight: 'calc(90vh - 92px)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
      gap: 18,
    },

    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    },

    fieldWide: {
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    fieldLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: '#8b6508',
      fontFamily: 'Arial, sans-serif',
    },

    formInput: {
      width: '100%',
      height: 48,
      padding: '0 14px',
      borderRadius: 15,
      border: '1px solid #dbe3ef',
      outline: 'none',
      fontSize: 14,
      color: '#334155',
      background: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    readOnlyInput: {
      background: '#f8fafc',
      color: '#64748b',
      cursor: 'not-allowed',
    },

    formTextarea: {
      height: 110,
      paddingTop: 12,
      resize: 'vertical',
    },

    overlayActions: {
      marginTop: 26,
      display: 'flex',
      justifyContent: 'flex-end',
    },

    formActions: {
      marginTop: 26,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      flexDirection: isMobile ? 'column-reverse' : 'row',
    },

    secondaryBtn: {
      height: 48,
      padding: '0 22px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      background: '#ffffff',
      color: '#334155',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
      boxShadow: 'inset 0 0 0 1px #dbe3ef',
    },

    passwordHint: {
      margin: '14px 0 0',
      color: '#64748b',
      fontSize: 13,
      lineHeight: 1.5,
      fontFamily: 'Arial, sans-serif',
    },

    saveBtn: {
      height: 48,
      padding: '0 26px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      backgroundColor: "#2563eb",
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 10px 20px rgba(139, 101, 8, 0.18)',
      width: isMobile ? '100%' : 'auto',
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

    validationModalOverlay: {
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

    validationModalContent: {
      width: isMobile ? '100%' : 460,
      maxWidth: 460,
      background: '#ffffff',
      borderRadius: 12,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    validationModalTitle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 22 : 24,
      fontWeight: 800,
      color: '#111827',
      margin: '0 0 16px',
    },

    validationModalDivider: {
      height: 1,
      background: '#d1d5db',
      marginBottom: 22,
    },

    validationModalText: {
      fontFamily: 'Arial, sans-serif',
      fontSize: isMobile ? 15 : 17,
      lineHeight: 1.5,
      color: '#666666',
      margin: '0 0 28px',
    },

    validationModalButton: {
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

export default createAdminSettingsStyles;