export default function createDentistScheduleStyles({
  isMobile,
  isTablet,
  isSmallScreen,
}) {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      backgroundColor: '#f4f7fb',
      fontFamily: 'Arial, sans-serif',
      color: '#0f1b3d',
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
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.24)',
    },

    notificationBadge: {
      marginLeft: 'auto',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      borderRadius: '999px',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 7px',
      display: isMobile || isTablet ? 'none' : 'inline-flex',
    },

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isMobile || isTablet ? 14 : 18,
      borderTop: '1px solid #e5e7eb',
    },

    logoutItem: {
      color: '#ef4444',
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

    doctorProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 52,
      padding: isMobile ? '0 10px' : '0 12px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      minWidth: 0,
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

    doctorInfo: {
      display: isMobile ? 'none' : 'block',
      minWidth: 0,
    },

    doctorName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
      whiteSpace: 'nowrap',
    },

    doctorSpecialization: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
      whiteSpace: 'nowrap',
    },

    headerActions: {
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
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

    heroCard: {
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
      fontSize: isMobile ? 22 : isTablet ? 26 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.2,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.5,
    },

    heroIcon: {
      width: isMobile ? 68 : isTablet ? 78 : 90,
      height: isMobile ? 68 : isTablet ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.22)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isMobile ? 32 : isTablet ? 36 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'minmax(220px, 0.7fr) minmax(280px, 0.95fr)',
      gap: 12,
      marginBottom: 16,
      alignItems: 'stretch',
      width: '100%',
      minWidth: 0,
    },

    infoCard: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      borderRadius: 16,
      border: '1px solid #e2e8f0',
      padding: '10px 14px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      minHeight: 50,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxSizing: 'border-box',
      minWidth: 0,
      overflow: 'hidden',
    },

    infoLabel: {
      fontFamily: 'Arial, sans-serif',
      margin: '0 0 4px',
      fontSize: 13,
      color: '#64748b',
      fontWeight: 600,
      padding: "4px 0",
    },

    infoValue: {
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      fontSize: 15,
      color: 'black',
      lineHeight: 1.35,
      wordBreak: 'break-word',
    },

    mainGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr',
      gap: isMobile ? 12 : 14,
      marginBottom: 14,
      width: '100%',
      minWidth: 0,
    },

    card: {
      backgroundColor: '#ffffff',
      borderRadius: 18,
      border: '1px solid #e2e8f0',
      padding: isMobile ? 16 : isTablet ? 18 : 22,
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
    },

    sectionHeader: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      gap: 10,
      flexDirection: isMobile ? 'column' : 'row',
    },

    sectionTitle: {
      margin: '0 0 16px',
      fontSize: isMobile ? 17 : 18,
      fontWeight: 800,
      color: '#0f1b3d',
      lineHeight: 1.25,
    },

    tableWrapper: {
      width: '100%',
      maxWidth: '100%',
      overflowX: 'auto',
      boxSizing: 'border-box',
    },

    table: {
      width: '100%',
      minWidth: 520,
      borderCollapse: 'collapse',
    },

    th: {
      padding: isMobile ? '12px 10px' : '13px 14px',
      backgroundColor: '#f1f5fb',
      color: '#0f1b3d',
      fontSize: 12,
      fontWeight: 800,
      textAlign: 'left',
      whiteSpace: 'nowrap',
    },

    tr: {
      borderBottom: '1px solid #e5eaf2',
    },

    td: {
      padding: isMobile ? '12px 10px' : '12px 14px',
      fontSize: 12,
      color: '#0f1b3d',
      verticalAlign: 'middle',
      whiteSpace: 'nowrap',
    },

    workingText: {
      color: '#16a34a',
      fontWeight: 800,
    },

    offText: {
      color: '#475569',
      fontWeight: 500,
    },

    requestList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minWidth: 0,
    },

    requestItem: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isTablet || isSmallScreen
          ? '82px minmax(0, 1fr)'
          : '84px minmax(0, 1fr) 176px',
      gap: 14,
      alignItems: 'center',
      padding: 14,
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px',
      borderRadius: 7,
      fontSize: 11,
      fontWeight: 700,
      width: 'fit-content',
      whiteSpace: 'nowrap',
    },

    pendingBadge: {
      backgroundColor: '#fff1cf',
      color: '#b36b00',
    },

    approvedBadge: {
      backgroundColor: '#dff8e7',
      color: '#15803d',
    },

    cancelledBadge: {
      backgroundColor: '#e2e8f0',
      color: '#475569',
    },

    rejectedBadge: {
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
    },

    requestInfo: {
      minWidth: 0,
    },

    requestTitle: {
      margin: '0 0 4px',
      fontSize: 13,
      fontWeight: 800,
      color: '#0f1b3d',
      lineHeight: 1.3,
    },

    requestSubtitle: {
      margin: 0,
      fontSize: 11,
      color: '#50617c',
      lineHeight: 1.4,
      wordBreak: 'break-word',
    },

    requestDate: {
      textAlign: isMobile || isTablet || isSmallScreen ? 'left' : 'right',
      display: 'block',
      gridColumn:
        isMobile ? 'auto' : isTablet || isSmallScreen ? '1 / -1' : 'auto',
    },

    requestDateText: {
      margin: '0 0 8px',
      fontSize: 11,
      color: '#0f1b3d',
      fontWeight: 600,
    },

    requestButtonGroup: {
      display: 'flex',
      justifyContent:
        isMobile || isTablet || isSmallScreen ? 'flex-start' : 'flex-end',
      gap: 8,
      flexWrap: 'wrap',
    },

    requestDetailsButton: {
      border: '1px solid #cfe0ff',
      backgroundColor: '#f8fbff',
      color: '#b8860b',
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 800,
      padding: '8px 10px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    },

    requestCancelButton: {
      border: '1px solid #fecaca',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 800,
      padding: '8px 10px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: '0.2s ease',
    },

    requestCancelButtonDisabled: {
      border: '1px solid #e5e7eb',
      backgroundColor: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed',
      opacity: 0.75,
    },

    requestCount: {
      margin: '16px 0 0',
      textAlign: 'center',
      fontSize: 12,
      color: '#50617c',
    },

    emptyState: {
      textAlign: 'center',
      padding: '24px 0',
      color: '#64748b',
      fontSize: 13,
    },

    actionRow: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
      minWidth: 0,
    },

    actionCard: {
      backgroundColor: '#ffffff',
      borderRadius: 18,
      border: '1px solid #e2e8f0',
      padding: isMobile ? '14px' : '16px 14px',
      boxShadow: '0 6px 18px rgba(15,23,42,0.04)',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: isMobile ? 'stretch' : 'center',
      textAlign: 'left',
      minHeight: 50,
      gap: isMobile ? 12 : 14,
      gridColumn: isMobile ? 'auto' : '1 / -1',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    actionTitle: {
      fontFamily: 'Arial, sans-serif',
      margin: '0 0 4px',
      fontSize: 13,
      color: '#64748b',
      fontWeight: 600,
    },

    actionText: {
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      fontSize: 13,
      color: 'black',
      fontWeight: 500,
      lineHeight: 1.4,
    },

    warningText: {
      margin: '8px 0 0',
      fontSize: 12,
      color: '#b45309',
      fontWeight: 700,
      lineHeight: 1.4,
    },

    primaryButton: {
      height: 36,
      border: "none",
      borderRadius: 8,
      backgroundColor: "#d4af37",
      color: "#ffffff",
      fontFamily: 'Arial, sans-serif',
      fontSize: 11,
      fontWeight: 800,
      padding: "10px 22px",
      cursor: "pointer",
      alignSelf: isMobile ? "stretch" : "center",
      minWidth: isMobile ? "100%" : 148,
      whiteSpace: "nowrap",
    },

    primaryButtonDisabled: {
      backgroundColor: '#e5e7eb',
      color: '#94a3b8',
      cursor: 'not-allowed',
      boxShadow: 'none',
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

    confirmGoldBtn: {
      background: '#d4af37',
      color: '#ffffff',
      fontWeight: 'bold',
    },

    submitLeaveButton: {
      flex: 1,
      height: 42,
      border: 'none',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      padding: '0 24px',
      cursor: 'pointer',
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      width: isMobile ? '100%' : 'auto',
    },

    leaveModalContent: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      width: isMobile ? '100%' : 440,
      maxWidth: '92vw',
      textAlign: 'left',
      padding: isMobile ? '22px 18px' : 28,
      boxShadow: '0 20px 60px rgba(15,23,42,0.18)',
      boxSizing: 'border-box',
      maxHeight: '90vh',
      overflowY: 'auto',
    },

    leaveConflictModalContent: {
      width: isMobile ? '100%' : 520,
      maxWidth: '92vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      background: '#ffffff',
      borderRadius: 22,
      padding: isMobile ? 24 : 30,
      textAlign: 'center',
      boxShadow: '0 22px 50px rgba(15, 23, 42, 0.22)',
      boxSizing: 'border-box',
    },

    leaveConflictList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      margin: '0 0 22px',
      maxHeight: 260,
      overflowY: 'auto',
      textAlign: 'left',
    },

    leaveConflictItem: {
      border: '1px solid #f3d879',
      borderRadius: 12,
      background: '#fffdf7',
      padding: '12px 14px',
      boxSizing: 'border-box',
    },

    leaveConflictDate: {
      display: 'block',
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      lineHeight: 1.35,
      marginBottom: 4,
    },

    leaveConflictMeta: {
      margin: 0,
      color: '#64748b',
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      lineHeight: 1.4,
    },

    leaveModalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 12,
    },

    leaveDateRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 12,
      marginBottom: 14,
    },

    leaveDateField: {
      flex: 1,
      minWidth: 0,
    },

    leaveLabel: {
      display: 'block',
      fontSize: 12,
      fontWeight: 700,
      color: '#0f1b3d',
      marginBottom: 6,
    },

    leaveInput: {
      width: '100%',
      height: 38,
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '0 10px',
      fontSize: 13,
      color: '#0f1b3d',
      boxSizing: 'border-box',
    },

    leaveDaysBox: {
      marginBottom: 14,
      padding: '10px 12px',
      borderRadius: 10,
      background: '#fffaf0',
      border: '1px solid #f3e8c0',
      color: '#8b6508',
      fontSize: 13,
      fontWeight: 600,
      lineHeight: 1.4,
    },

    leaveReasonBox: {
      marginBottom: 20,
    },

    leaveTextarea: {
      width: '100%',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: 10,
      fontSize: 13,
      color: '#0f1b3d',
      resize: 'vertical',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      minHeight: 100,
    },

    submitErrorText: {
      color: '#ef4444',
      fontSize: 12,
      marginBottom: 10,
    },

    detailsModalContent: {
      width: isMobile ? '100%' : 520,
      maxWidth: '92vw',
      textAlign: 'left',
      padding: isMobile ? '22px 18px' : '28px 28px 24px',
      maxHeight: '90vh',
      overflowY: 'auto',
    },

    detailsModalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      gap: 12,
    },

    detailsCloseButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: 24,
      color: '#64748b',
      lineHeight: 1,
      padding: 0,
      flexShrink: 0,
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '14px 16px',
      marginBottom: 20,
    },

    detailsField: {
      minWidth: 0,
    },

    detailsFieldFull: {
      gridColumn: isMobile ? 'auto' : '1 / -1',
    },

    detailsLabel: {
      fontSize: 11,
      fontWeight: 800,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      marginBottom: 6,
    },

    detailsValue: {
      minHeight: 42,
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      backgroundColor: '#f8fafc',
      padding: '11px 12px',
      boxSizing: 'border-box',
      fontSize: 13,
      color: '#0f1b3d',
      display: 'flex',
      alignItems: 'center',
      lineHeight: 1.4,
      wordBreak: 'break-word',
    },

    detailsTextarea: {
      minHeight: 112,
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      backgroundColor: '#f8fafc',
      padding: 12,
      boxSizing: 'border-box',
      fontSize: 13,
      color: '#0f1b3d',
      lineHeight: 1.5,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },

    detailsCancelButton: {
      height: 42,
      border: 'none',
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      padding: '0 24px',
      cursor: 'pointer',
      backgroundColor: '#ef4444',
      color: '#ffffff',
      width: isMobile ? '100%' : 'auto',
    },

    detailsCancelButtonDisabled: {
      backgroundColor: '#cbd5e1',
      color: '#64748b',
      cursor: 'not-allowed',
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

    validationModalActions: {
      display: 'flex',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    validationModalButton: {
      minWidth: 120,
      height: 38,
      border: 'none',
      borderRadius: 8,
      background: '#d4af37',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      padding: '0 24px',
    },

    validationModalCancelButton: {
      minWidth: 120,
      height: 38,
      border: 'none',
      borderRadius: 8,
      background: '#f1f5f9',
      color: '#334155',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      padding: '0 24px',
    },
  };
}
