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
      background: '#d4af37',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },

    avatarSmallImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
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
      backgroundColor: '#d4af37',
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

    websiteFieldsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 20,
    },

    websiteFieldsGrid: {
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: 24,
      alignItems: "start",
      marginBottom: 28,
    },

    websiteFields: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(340px, 1fr))",
      gap: 14,
      alignItems: "start",
      marginBottom: 18,
    },

    websiteSectionTitle: {
      fontSize: 20,
      fontWeight: 700,
      margin: "28px 0 16px",
      color: "#1e293b",
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
      margin: '20px 0',
      padding: isMobile ? 16 : 22,
      borderRadius: 18,
      border: '1px solid #dbe4f0',
      background: '#ffffff',
      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? 16 : 24,
      alignItems: 'start',
      boxSizing: 'border-box',
    },

    websiteDesignTitle: {
      gridColumn: '1 / -1',
      margin: '0 0 6px',
      color: '#0f172a',
      fontSize: isMobile ? 18 : 20,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      paddingBottom: 12,
      borderBottom: '2px solid #eef2f7',
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
      display: "grid",
      gridTemplateColumns: "300px 1fr",
      gap: 24,
      alignItems: "start",
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

    overlay: {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? 18 : 36,
      background: "rgba(17,24,39,.68)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      boxSizing: "border-box",
    },

    overlayContent: {
      width: 880,
      maxWidth: "100%",
      maxHeight: "92vh",
      display: "flex",
      flexDirection: "column",
      background: "#ffffff",
      borderRadius: 28,
      border: "1px solid #e5e7eb",
      boxShadow: "0 35px 90px rgba(15,23,42,.28)",
      overflow: "hidden",
    },

    overlayHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: isMobile ? "20px 22px" : "24px 30px",
      background: "linear-gradient(135deg,#ffffff,#f8fafc)",
      borderBottom: "1px solid #edf2f7",
      flexShrink: 0,
    },

    overlayTitle: {
      margin: 0,
      fontSize: isMobile ? 22 : 26,
      fontWeight: 800,
      color: "#172033",
      fontFamily: "Arial, sans-serif",
      letterSpacing: ".3px",
    },

    overlayClose: {
      width: 46,
      height: 46,
      border: "1px solid #dbe4ee",
      borderRadius: 14,
      background: "#ffffff",
      color: "#64748b",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      transition: ".25s ease",
      boxShadow: "0 6px 18px rgba(15,23,42,.08)",
    },

    overlayBody: {
      flex: 1,
      overflowY: "auto",
      padding: isMobile ? 22 : 30,
      background: "#f8fafc",
      boxSizing: "border-box",
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

    accountHeaderProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      minWidth: 0,
    },

    profileAvatarButton: {
      position: 'relative',
      width: isMobile ? 60 : 72,
      height: isMobile ? 60 : 72,
      borderRadius: isMobile ? 18 : 20,
      background: 'linear-gradient(135deg, #b8860b, #d4af37)',
      color: '#ffffff',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 10px 24px rgba(212, 175, 55, 0.35)',
      cursor: 'pointer',
      overflow: 'hidden',
      padding: 0,
    },

    profileAvatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
    },

    profileAvatarIcon: {
      fontSize: isMobile ? 22 : 24,
    },

    profileAvatarCamera: {
      position: 'absolute',
      right: -1,
      bottom: -1,
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: '#d4af37',
      color: '#ffffff',
      border: '2px solid #ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      boxShadow: '0 8px 18px rgba(139, 101, 8, 0.22)',
    },

    removePhotoBtn: {
      border: '1px solid #fecaca',
      background: '#fee2e2',
      color: '#dc2626',
      borderRadius: 10,
      padding: '6px 9px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      marginTop: 7,
    },

    phoneInputContainer: {
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '132px minmax(0, 1fr)',
      gap: 10,
      boxSizing: 'border-box',
    },

    phoneCountrySelect: {
      width: '100%',
      minWidth: 0,
      height: 48,
      border: '1px solid #dbe3ef',
      borderRadius: 15,
      padding: '0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      background: '#f8fafc',
      outline: 'none',
      boxSizing: 'border-box',
    },

    phoneInput: {
      width: '100%',
      minWidth: 0,
      height: 48,
      border: '1px solid #dbe3ef',
      borderRadius: 15,
      padding: '0 14px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#334155',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    phoneInputError: {
      borderColor: '#dc2626',
      borderWidth: 2,
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
      gap: 10,
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

    clearBtn: {
      height: 48,
      padding: '0 22px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      background: "#fff1f2",
      color: "#dc2626",
      border: "1px solid #fecdd3",
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      width: isMobile ? '100%' : 'auto',
      boxShadow: 'inset 0 0 0 1px #dbe3ef',
    },

    clearBtnHover: {
      background: "#fee2e2",
      borderColor: "#ef4444",
    },

    saveBtn: {
      height: 48,
      padding: '0 26px',
      border: 'none',
      outline: 'none',
      borderRadius: 15,
      backgroundColor: '#d4af37',
      color: '#ffffff',
      cursor: 'pointer',
      fontSize: 13,
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

    leaveDecisionModalContent: {
      width: isMobile ? '100%' : 520,
      maxWidth: 520,
      textAlign: 'left',
    },

    leaveDecisionDetails: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 10,
      marginBottom: 18,
    },

    leaveDecisionRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '135px 1fr',
      gap: isMobile ? 4 : 12,
      alignItems: 'start',
      padding: '10px 12px',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      background: '#f8fafc',
    },

    leaveDecisionLabel: {
      color: '#64748b',
      fontSize: 12,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      fontFamily: 'Arial, sans-serif',
    },

    leaveDecisionValue: {
      color: '#0f172a',
      fontSize: 14,
      lineHeight: 1.4,
      wordBreak: 'break-word',
      fontFamily: 'Arial, sans-serif',
    },

    leaveDecisionQuestion: {
      color: '#334155',
      fontSize: 15,
      lineHeight: 1.5,
      margin: '0 0 20px',
      fontFamily: 'Arial, sans-serif',
    },

    leaveRejectTextarea: {
      width: '100%',
      minHeight: 110,
      resize: 'vertical',
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      padding: 12,
      color: '#0f172a',
      fontSize: 14,
      lineHeight: 1.5,
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 10,
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
      minWidth: 130,
      height: 44,
      borderRadius: 12,
      border: 'none',
      cursor: 'pointer',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 13,
    },

    logoutBtn: {
      background: '#dc2626',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    approveConfirmBtn: {
      background: '#16a34a',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    rejectConfirmBtn: {
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

    logoCard: {
      display: 'grid',
      gridTemplateColumns: '340px 1fr',
      gap: 32,
      alignItems: 'flex-start',
      padding: 0,
      background: 'transparent',
    },

    logoPreviewPanel: {
      background: '#ffffff',
      borderRadius: 18,
      border: '1px solid #edf2f7',
      padding: '28px 22px',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(15,23,42,.05)',
    },

    logoPreview: {
      width: 200,
      height: 200,
      margin: '0 auto 20px',
      borderRadius: 20,
      background: 'linear-gradient(180deg,#fafbfc,#f1f5f9)',
      border: '2px dashed #d7dee8',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },

    logoRight: {
      background: '#ffffff',
      borderRadius: 18,
      border: '1px solid #edf2f7',
      padding: 28,
      boxShadow: '0 8px 24px rgba(15,23,42,.05)',
    },

    logoHeading: {
      margin: 0,
      fontSize: 24,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
    },

    logoText: {
      margin: '10px 0 24px',
      color: '#64748b',
      fontSize: 14,
      lineHeight: 1.7,
      fontFamily: 'Arial, sans-serif',
    },

  logoUploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '12px 20px',
    borderRadius: 12,
    border: '1px solid #e7b93e',
    background: '#fff',
    color: '#b8860b',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    transition: '.25s ease',
    boxShadow: '0 4px 12px rgba(212,175,55,.15)',
    marginLeft: 'auto',
  },

    logoUploadBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
      pointerEvents: 'none',
      background: '#f8fafc',
      border: '1px solid #dbe4ee',
      color: '#94a3b8',
      boxShadow: 'none',
    },

    logoInfo: {
      marginTop: 12,
      marginBottom: 24,
      color: '#94a3b8',
      fontSize: 13,
      lineHeight: 1.6,
      fontFamily: 'Arial, sans-serif',
    },

    logoOption: {
      width: 260,
    },

    logoSelectWrapper: {
      position: 'relative',
    },

    logoSelect: {
      width: '100%',
      height: 48,
      padding: '0 42px 0 14px',
      border: '1px solid #dbe4ee',
      borderRadius: 12,
      background: '#fff',
      color: '#334155',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      appearance: 'none',
      outline: 'none',
      cursor: 'pointer',
      transition: '.2s ease',
    },

    logoSelectIcon: {
      position: 'absolute',
      top: '50%',
      right: 14,
      transform: 'translateY(-50%)',
      color: '#94a3b8',
      fontSize: 16,
      pointerEvents: 'none',
    },

    websiteAnnouncementHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 20,
      marginBottom: 24,
      flexWrap: 'wrap',
    },

    websiteAnnouncementTitle: {
      margin: 0,
      fontSize: 22,
      fontWeight: 700,
      color: '#1e293b',
    },

    websiteAnnouncementSubtitle: {
      marginTop: 6,
      fontSize: 14,
      color: '#64748b',
      lineHeight: 1.6,
    },

    websiteAnnouncementGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 20,
    },

    websiteAnnouncementCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 8px 20px rgba(15,23,42,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    },

    websiteAnnouncementCardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    websiteAnnouncementIconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      background: '#fff8eb',
      color: '#8b6508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
    },

    websiteAnnouncementCardTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: '#1e293b',
    },

    websiteAnnouncementCardMessage: {
      margin: 0,
      color: '#64748b',
      fontSize: 14,
      lineHeight: 1.7,
    },

    websiteAnnouncementDateRow: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    websiteAnnouncementDateBox: {
      flex: 1,
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: 12,
    },

    websiteAnnouncementDateLabel: {
      display: 'block',
      fontSize: 12,
      color: '#94a3b8',
      marginBottom: 6,
    },

    websiteAnnouncementDateValue: {
      fontSize: 14,
      fontWeight: 700,
      color: '#1e293b',
    },

    websiteAnnouncementActions: {
      display: 'flex',
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
      marginTop: 20,
    },

    websiteAnnouncementEditBtn: {
      flex: 1,
      border: 'none',
      borderRadius: 10,
      background: '#8b6508',
      color: '#ffffff',
      padding: '11px 16px',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: '0.2s',
    },

    websiteAnnouncementDeleteBtn: {
      flex: 1,
      border: '1px solid #fecaca',
      borderRadius: 10,
      background: '#ffffff',
      color: '#dc2626',
      padding: '11px 16px',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      transition: '0.2s',
    },

    websiteAnnouncementEmpty: {
      gridColumn: '1 / -1',
      minHeight: 260,
      border: '2px dashed #cbd5e1',
      borderRadius: 16,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      color: '#64748b',
      textAlign: 'center',
      padding: 24,
    },

    websiteAnnouncementEmptyIcon: {
      fontSize: 42,
      color: '#cbd5e1',
    },
  };
};

export default createAdminSettingsStyles;
