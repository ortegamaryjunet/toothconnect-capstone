const createRecepReceiptsStyles = ({
  isMobile = false,
  isVerySmall = false,
  isSmallScreen = false,
  isTablet = false,
} = {}) => {
  const sidebarWidth = isVerySmall ? 70 : isMobile ? 80 : 250;

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
      gap: isMobile ? 0 : 12,
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
      marginTop: 'auto',
      paddingTop: 18,
      borderTop: '1px solid #e5e7eb',
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

    receptProfile: {
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

    receptInfo: {
      display: isMobile ? 'none' : 'block',
    },

    receptName: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
    },

    receptPosition: {
      fontSize: 12,
      textAlign: 'left',
      color: '#64748b',
      marginTop: 2,
    },

    receiptContent: {
      padding: isVerySmall
        ? '88px 14px 22px'
        : isMobile
          ? '100px 18px 26px'
          : isTablet
            ? '98px 20px 26px'
            : isSmallScreen
              ? '104px 24px 28px'
              : '110px 28px 32px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden',
    },

    pageHero: {
      position: 'relative',
      width: '100%',
      minHeight: isVerySmall ? 'auto' : 190,
      borderRadius: isVerySmall ? 18 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isVerySmall ? 18 : isMobile ? 22 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexDirection: isMobile ? 'column' : 'row',
      boxSizing: 'border-box',
    },

    heroContent: {
      flex: 1,
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isVerySmall ? 23 : isSmallScreen ? 28 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: 1.3,
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 1.6,
      marginBottom: 0,
    },

    heroIcon: {
      width: isVerySmall ? 68 : 90,
      height: isVerySmall ? 68 : 90,
      minWidth: isVerySmall ? 68 : 90,
      borderRadius: isVerySmall ? 18 : 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroIconText: {
      fontSize: isVerySmall ? 30 : 42,
      color: '#ffffff',
    },

    receiptTools: {
      display: 'flex',
      alignItems: isSmallScreen ? 'stretch' : 'center',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 20,
      flexDirection: isSmallScreen ? 'column' : 'row',
    },

    searchBox: {
      flex: 1,
      minWidth: 0,
      minHeight: 48,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '0 15px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: '#b8860b',
      fontSize: 17,
    },

    searchInput: {
      width: '100%',
      border: 'none',
      outline: 'none',
      fontSize: 14,
      color: '#172033',
      background: 'transparent',
      fontFamily: 'Arial, sans-serif',
    },

    statusFilter: {
      width: isSmallScreen ? '100%' : 210,
      height: 48,
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      padding: '0 14px',
      background: '#ffffff',
      color: '#334155',
      outline: 'none',
      fontSize: 14,
      cursor: 'pointer',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
    },

    receiptList: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 16,
    },

    receiptCard: {
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 22,
      padding: isVerySmall ? 16 : 18,
      boxShadow: '0 10px 26px rgba(15, 23, 42, 0.05)',
      boxSizing: 'border-box',
      transition: 'border-color 180ms ease, box-shadow 180ms ease, background 180ms ease',
    },

    receiptCardHighlighted: {
      borderColor: '#b8860b',
      background: '#eff6ff',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.16), 0 18px 34px rgba(37, 99, 235, 0.18)',
    },

    receiptSummary: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: isVerySmall ? 14 : 18,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    receiptMain: {
      display: 'flex',
      alignItems: isVerySmall ? 'flex-start' : 'center',
      gap: 14,
      minWidth: 0,
    },

    receiptIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      background: '#eff6ff',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: 23,
    },

    receiptPatientName: {
      color: '#0f172a',
      fontSize: isVerySmall ? 17 : 18,
      marginBottom: 5,
      marginTop: 0,
    },

    receiptSummaryText: {
      color: '#64748b',
      fontSize: 14,
      lineHeight: 1.5,
      margin: 0,
    },

    status: {
      padding: '8px 14px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: 'nowrap',
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusValidated: {
      background: '#dcfce7',
      color: '#15803d',
    },

    statusRejected: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    receiptMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: isVerySmall ? 8 : 10,
      margin: '16px 0 0',
    },

    receiptMetaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '8px 11px',
      borderRadius: 999,
      background: '#f8fafc',
      color: '#475569',
      fontSize: isVerySmall ? 12 : 13,
      border: '1px solid #e5e7eb',
    },

    summaryActions: {
      display: 'flex',
      justifyContent: isVerySmall ? 'stretch' : 'flex-end',
      marginTop: 16,
    },

    viewDetailsBtn: {
      border: 'none',
      borderRadius: 14,
      background: '#eff6ff',
      color: '#b8860b',
      padding: '11px 15px',
      fontSize: 13,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      cursor: 'pointer',
      transition: '0.25s ease',
      width: isVerySmall ? '100%' : 'auto',
    },

    receiptFullDetails: {
      marginTop: 18,
      paddingTop: 18,
      borderTop: '1px solid #e5e7eb',
    },

    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      gap: 14,
    },

    detailBox: {
      padding: 16,
      borderRadius: 16,
      background: '#f8fafc',
      border: '1px solid #e5e7eb',
      minWidth: 0,
    },

    detailLabel: {
      display: 'block',
      marginBottom: 7,
      color: '#64748b',
      fontWeight: 600,
      fontSize: 13,
    },

    detailValue: {
      color: '#172033',
      fontSize: 16,
      fontWeight: 600,
      margin: 0,
      wordBreak: 'break-word',
    },

    amountDisplayRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap',
    },

    amountEditRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },

    amountInput: {
      width: 130,
      height: 38,
      border: '1px solid #cbd5e1',
      borderRadius: 10,
      padding: '0 10px',
      outline: 'none',
      fontSize: 14,
      color: '#172033',
      background: '#ffffff',
      boxSizing: 'border-box',
    },

    amountEditBtn: {
      border: 'none',
      padding: '8px 10px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: '#b8860b',
      background: '#dbeafe',
    },

    amountSaveBtn: {
      border: 'none',
      padding: '9px 11px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 800,
      color: '#ffffff',
      background: '#b8860b',
    },

    amountCancelBtn: {
      border: 'none',
      padding: '9px 11px',
      borderRadius: 10,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 800,
      color: '#475569',
      background: '#e2e8f0',
    },

    uploadedReceiptSection: {
      marginTop: 22,
      padding: 20,
      borderRadius: 18,
      background: '#f8fbff',
      border: '1px solid #dbeafe',
    },

    uploadedReceiptHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 14,
      marginBottom: 14,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    uploadedReceiptTitle: {
      fontSize: 18,
      color: '#0f172a',
      marginBottom: 5,
      marginTop: 0,
    },

    uploadedReceiptSubtitle: {
      color: '#64748b',
      fontSize: 14,
      lineHeight: 1.5,
      margin: 0,
    },

    receiptFileType: {
      padding: '7px 11px',
      borderRadius: 999,
      background: '#dbeafe',
      color: '#b8860b',
      fontSize: 12,
      fontWeight: 800,
    },

    uploadedReceiptBox: {
      display: 'flex',
      alignItems: isVerySmall ? 'flex-start' : 'center',
      gap: 14,
      padding: 16,
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #dbeafe',
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    receiptPreview: {
      width: 72,
      height: 72,
      borderRadius: 18,
      background: '#eff6ff',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontSize: 30,
    },

    receiptInfo: {
      minWidth: 0,
    },

    receiptFileName: {
      color: '#172033',
      fontSize: 15,
      marginBottom: 5,
      marginTop: 0,
      wordBreak: 'break-word',
    },

    receiptUploadedAt: {
      color: '#64748b',
      fontSize: 13,
      marginBottom: 10,
      marginTop: 0,
    },

    viewReceiptLink: {
      width: 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      color: '#b8860b',
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 800,
    },

    referenceSection: {
      marginTop: 20,
    },

    referenceLabel: {
      display: 'block',
      marginBottom: 8,
      color: '#334155',
      fontSize: 14,
      fontWeight: 700,
    },

    referenceInput: {
      width: '100%',
      height: 46,
      border: '1px solid #cbd5e1',
      borderRadius: 14,
      padding: '0 14px',
      outline: 'none',
      fontSize: 14,
      background: '#f8fafc',
      color: '#172033',
      boxSizing: 'border-box',
    },

    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
      flexDirection: isMobile ? 'column' : 'row',
    },

    rejectBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#fee2e2',
      color: '#dc2626',
      width: isMobile ? '100%' : 'auto',
    },

    validateBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#b8860b',
      color: '#ffffff',
      width: isMobile ? '100%' : 'auto',
    },

    reopenUploadBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#fef3c7',
      color: '#92400e',
      width: isMobile ? '100%' : 'auto',
    },

    actionBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    emptyState: {
      textAlign: 'center',
      padding: '42px 20px',
      color: '#64748b',
    },

    emptyStateIcon: {
      fontSize: 42,
      color: '#b8860b',
      marginBottom: 12,
    },

    emptyStateTitle: {
      color: '#0f172a',
      marginBottom: 6,
      marginTop: 0,
    },

    emptyStateText: {
      margin: 0,
      color: '#64748b',
      fontSize: 14,
    },

    messageModal: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.58)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      zIndex: 9999,
      boxSizing: 'border-box',
    },

    messageBox: {
      width: '100%',
      maxWidth: 390,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? '24px 20px' : 28,
      textAlign: 'center',
      boxSizing: 'border-box',
    },

    messageIcon: {
      width: 66,
      height: 66,
      borderRadius: 22,
      background: '#dcfce7',
      color: '#15803d',
      margin: '0 auto 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
    },

    messageIconError: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    messageTitle: {
      fontSize: 21,
      color: '#0f172a',
      marginBottom: 8,
      marginTop: 0,
    },

    messageText: {
      color: '#64748b',
      fontSize: 14,
      lineHeight: 1.5,
      margin: 0,
    },

    messageButton: {
      width: '100%',
      marginTop: 20,
      border: 'none',
      borderRadius: 14,
      background: '#b8860b',
      color: '#ffffff',
      padding: 12,
      cursor: 'pointer',
      fontWeight: 800,
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
      width: isVerySmall ? '100%' : 380,
      maxWidth: 380,
      background: '#ffffff',
      borderRadius: 22,
      padding: isVerySmall ? 24 : 30,
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
      flexDirection: isVerySmall ? 'column' : 'row',
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

    profileDropdownWrapper: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },

    profileDropdown: {
      position: 'absolute',
      top: 'calc(100% + 8px)',
      right: 0,
      width: '100%',
      minWidth: 170,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 14,
      padding: 8,
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
      zIndex: 300,
      boxSizing: 'border-box',
    },

    viewProfileButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: '#eff6ff',
      color: '#2563eb',
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      textDecoration: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
  };
};

export default createRecepReceiptsStyles;
