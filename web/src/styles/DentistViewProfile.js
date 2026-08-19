const createDentistViewProfileStyles = ({
  isMobile = false,
  isSmallScreen = false,
  isVerySmall = false,
  isAdminView = false,
} = {}) => {
  const topHeaderHeight = 70;
  const sidebarWidth = isMobile ? 84 : 260;
  const primaryGradient = 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)';
  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff9e8';
  const primaryBorder = '#f2dd92';
  const primaryShadow = '0 12px 28px rgba(37, 99, 235, 0.18)';

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#eef4ff',
      fontFamily: 'Arial, sans-serif',
      color: '#172554',
      overflow: 'hidden',
      boxSizing: 'border-box',
    },

    topHeader: {
      position: 'fixed',
      top: 0,
      left: 0,
      height: topHeaderHeight,
      width: '100%',
      background: 'rgba(255,255,255,.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      padding: isMobile ? '0 16px' : '0 28px',
      boxShadow: '0 10px 30px rgba(15,23,42,.05)',
      zIndex: 1000,
      boxSizing: 'border-box',
    },

    backLink: {
      minWidth: 100,
      height: 42,
      padding: '0 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      border: '1px solid #e8c75f',
      background: '#fff8df',
      color: '#8b6508',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 600,
      fontFamily: '"Inter", Arial, sans-serif',
      transition: 'all .2s ease',
      boxSizing: 'border-box',
    },

    headerTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isMobile ? 18 : 24,
      color: '#0f172a',
      lineHeight: 1.2,
      fontWeight: 700,
    },

    sidebar: {
      position: 'fixed',
      top: topHeaderHeight,
      left: 0,
      bottom: 0,
      width: sidebarWidth,
      background: '#ffffff',
      borderRight: '1px solid #edf2f7',
      padding: isMobile ? '18px 10px' : '22px 18px',
      overflowY: 'auto',
      boxSizing: 'border-box',
      boxShadow: '10px 0 30px rgba(15,23,42,.03)',
    },

    menuItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 20,
      fontSize: 15,
      fontWeight: 500,
      padding: isMobile ? '15px' : '15px 18px',
      marginBottom: 10,
      borderRadius: 16,
      cursor: 'pointer',
      color: '#475569',
      transition: '.25s',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    menuItemActive: {
      background: 'linear-gradient(135deg,#8b6508,#d4af37)',
      color: '#ffffff',
      fontWeight: 700,
      boxShadow: '0 12px 24px rgba(212,175,55,.28)',
    },

    menuItemIcon: {
      marginRight: isMobile ? 0 : 10,
      fontSize: 19,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
      fontSize: 15,
    },

    mainContainer: {
      position: 'fixed',
      top: topHeaderHeight,
      left: sidebarWidth,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: '#eef4ff',
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
      color: primaryDark,
      marginBottom: 14,
      background: primarySoft,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      padding: 14,
      fontSize: 14,
      fontWeight: 700,
    },

    sectionBanner: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      minHeight: 92,
      background: '#ffffff',
      borderRadius: 24,
      padding: isVerySmall ? '20px' : '20px 30px',
      marginBottom: 24,
      border: '1px solid #e5e7eb',
      borderLeft: '6px solid #d4af37',
      boxShadow: '0 10px 30px rgba(15,23,42,.05)',
      boxSizing: 'border-box',
    },

    sectionBannerTitle: {
      margin: 0,
      fontSize: isVerySmall ? 24 : 30,
      fontWeight: 700,
      color: '#0f172a',
      lineHeight: 1.2,
    },

    sectionBannerText: {
      margin: 0,
      fontSize: 14,
      color: '#64748b',
      lineHeight: 1.5,
      textAlign: 'left',
    },

    patientCard: {
      background: '#ffffff',
      border: '1px solid #edf2f7',
      borderRadius: 24,
      padding: isVerySmall ? 20 : 28,
      marginBottom: 24,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 22,
      boxSizing: 'border-box',
      boxShadow: '0 15px 35px rgba(15,23,42,.05)',
    },

    patientAvatar: {
      width: isVerySmall ? 74 : 90,
      height: isVerySmall ? 74 : 90,
      borderRadius: 22,
      background: primarySoft,
      color: primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isVerySmall ? 34 : 42,
      flexShrink: 0,
    },

    patientName: {
      margin: '0 0 8px',
      fontSize: isVerySmall ? 22 : 30,
      color: '#0f172a',
      fontWeight: 700,
    },

    patientNumber: {
      margin: 0,
      color: '#64748b',
      fontSize: 15,
    },

    infoCard: {
      background: '#ffffff',
      border: '1px solid #edf2f7',
      borderRadius: 24,
      padding: isVerySmall ? 20 : 28,
      marginBottom: 24,
      boxSizing: 'border-box',
      boxShadow: '0 10px 30px rgba(15,23,42,.04)',
    },

    infoCardTitle: {
      margin: 0,
      fontSize: 22,
      color: '#0f172a',
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '.5px',
    },

    subHeading: {
      margin: '20px 0 14px',
      fontSize: 12,
      color: primaryDark,
      fontWeight: 600,
      textTransform: 'uppercase',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(auto-fit, minmax(240px,1fr))',
      gap: 18,
      marginTop: 10,
    },

    infoBox: {
      background: '#fbfcff',
      border: '1px solid #edf2f7',
      borderRadius: 18,
      padding: 20,
      minHeight: 90,
      boxSizing: 'border-box',
      transition: '.25s',
      boxShadow: '0 6px 18px rgba(15,23,42,.03)',
    },

    infoBoxFull: {
      gridColumn: isSmallScreen ? 'span 1' : 'span 3',
    },

    infoLabel: {
      display: 'block',
      fontSize: 12,
      color: '#64748b',
      marginBottom: 8,
      textTransform: 'uppercase',
      fontWeight: 700,
    },

    infoValue: {
      fontSize: 15,
      color: '#0f172a',
      fontWeight: 600,
      wordBreak: 'break-word',
      lineHeight: 1.6,
    },

    emptyBox: {
      background: '#fbfcff',
      border: '1px dashed #dbeafe',
      borderRadius: 18,
      padding: 20,
      color: '#64748b',
      margin: 0,
      marginTop: 10,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 1.6,
    },

    conditionList: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(auto-fit, minmax(220px,1fr))',
      gap: 16,
    },

    conditionChip: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: '#ffffff',
      border: '1px solid #edf2f7',
      borderRadius: 18,
      padding: '14px 18px',
      fontSize: 14,
      fontWeight: 600,
      color: '#0f172a',
      boxShadow: '0 8px 20px rgba(15,23,42,.04)',
      transition: '.25s',
    },

    filterCard: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: 22,
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
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 14px',
      background: '#f8fafc',
      boxSizing: 'border-box',
    },

    searchIcon: {
      color: primary,
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
      minWidth: 170,
      padding: '0 16px',
      borderRadius: 14,
      border: '1px solid #d1d5db',
      background: '#ffffff',
      color: '#334155',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      transition: '.2s',
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
      borderRadius: 18,
      border: '1px solid #edf0f5',
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
      color: '#64748b',
      fontSize: 12,
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
      color: '#9ca3af',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 500,
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
      background: primarySoft,
      color: primaryDark,
    },

    statusPending: {
      background: '#fef3c7',
      color: '#b45309',
    },

    statusCancelled: {
      background: '#fee2e2',
      color: '#dc2626',
    },

    attachmentStrip: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      minHeight: 34,
    },

    attachmentThumbBtn: {
      width: 34,
      height: 34,
      padding: 0,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 8,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    },

    attachmentThumbImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },

    attachmentFileIcon: {
      fontSize: 16,
    },

    attachmentMore: {
      minWidth: 28,
      height: 28,
      padding: '0 6px',
      borderRadius: 999,
      background: primary,
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    historyNoteWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 7,
      maxWidth: 260,
      whiteSpace: 'normal',
    },

    rescheduleTag: {
      border: `1px solid ${primaryBorder}`,
      borderRadius: 999,
      background: primarySoft,
      color: primaryDark,
      padding: '5px 9px',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
    },

    attachmentEmptyText: {
      color: '#94a3b8',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentBtn: {
      minWidth: 132,
      height: 34,
      padding: '0 10px',
      borderRadius: 9,
      border: `1px solid ${primaryDark}`,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    },

    historyAttachmentCount: {
      minWidth: 22,
      height: 22,
      padding: '0 3px',
      borderRadius: 999,
      background: primary,
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1,
      flexShrink: 0,
    },

    attachmentLightboxOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,.82)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 24,
      boxSizing: 'border-box',
    },

    attachmentLightboxContent: {
      position: 'relative',
      width: '100%',
      maxWidth: 960,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: 24,
      padding: 24,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'auto',
      boxShadow: '0 25px 60px rgba(15,23,42,.25)',
    },

    historyAttachmentModal: {
      position: 'relative',
      width: '100%',
      maxWidth: 760,
      maxHeight: 'calc(100vh - 80px)',
      background: '#ffffff',
      borderRadius: 24,
      padding: isVerySmall ? 20 : 28,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(15,23,42,.20)',
      display: 'flex',
      flexDirection: 'column',
    },

    rescheduleModal: {
      position: 'relative',
      width: '100%',
      maxWidth: 520,
      maxHeight: 'calc(100vh - 96px)',
      background: '#ffffff',
      borderRadius: 18,
      padding: isMobile ? 18 : 22,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
    },

    rescheduleDetails: {
      margin: '16px 0 0',
      padding: 14,
      borderRadius: 12,
      border: `1px solid ${primaryBorder}`,
      background: '#fffdf5',
      color: '#334155',
      fontSize: 13,
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
      maxHeight: '54vh',
      overflowY: 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 16,
      paddingRight: 36,
      marginBottom: 16,
    },

    historyAttachmentMeta: {
      margin: '6px 0 0',
      color: '#475569',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentList: {
      display: 'grid',
      gap: 10,
      maxHeight: isMobile ? '50vh' : '56vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 4,
      minHeight: 0,
    },

    historyAttachmentItem: {
      display: 'grid',
      gridTemplateColumns: '48px 1fr 38px',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 12,
      border: `1px solid ${primaryBorder}`,
      background: '#fffdf5',
      boxSizing: 'border-box',
    },

    historyAttachmentThumb: {
      width: 48,
      height: 48,
      borderRadius: 10,
      border: `1px solid ${primaryBorder}`,
      background: primarySoft,
      color: primaryDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    },

    historyAttachmentInfo: {
      minWidth: 0,
      display: 'grid',
      gap: 4,
    },

    historyAttachmentName: {
      color: '#0f172a',
      fontSize: 14,
      fontWeight: 800,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentSubtext: {
      color: '#64748b',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    historyIconActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 9,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 15,
    },

    historyAttachmentEmpty: {
      padding: 18,
      borderRadius: 12,
      border: `1px dashed ${primaryBorder}`,
      background: primarySoft,
      color: primaryDark,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentCloseBtn: {
      position: 'absolute',
      top: 12,
      right: 14,
      background: primarySoft,
      border: `1px solid ${primaryBorder}`,
      fontSize: 18,
      color: primaryDark,
      cursor: 'pointer',
      padding: '2px 6px',
      lineHeight: 1,
      borderRadius: 8,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentPreviewTitle: {
      margin: '0 40px 14px 0',
      fontSize: 17,
      fontWeight: 800,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentPreviewImage: {
      width: '100%',
      maxHeight: '74vh',
      objectFit: 'contain',
      borderRadius: 12,
      background: '#0f172a',
    },

    attachmentPreviewFrame: {
      width: '100%',
      height: '74vh',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: '#ffffff',
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
      zIndex: 9999,
      inset: 0,
      background: 'rgba(15,23,42,.55)',
      backdropFilter: 'blur(5px)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif',
    },

    backModalContent: {
      width: '100%',
      maxWidth: 450,
      background: '#ffffff',
      padding: isVerySmall ? '28px 22px' : '34px 30px',
      borderRadius: 28,
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(15,23,42,.20)',
      boxSizing: 'border-box',
    },

    backModalIcon: {
      width: 90,
      height: 90,
      margin: '0 auto 18px',
      background: '#fff1f2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ef4444',
    },

    modalIconText: {
      fontSize: 36,
    },

    backModalTitle: {
      margin: '0 0 12px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      color: '#0f172a',
      fontWeight: 700,
    },

    backModalText: {
      margin: '0 0 28px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.7,
    },

    backModalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 14,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    backModalButton: {
      minWidth: isVerySmall ? '100%' : 120,
      border: 'none',
      borderRadius: 14,
      padding: '13px 22px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: 14,
      transition: '.25s',
    },

    backCancelBtn: {
      background: '#f1f5f9',
      color: '#334155',
    },

    backConfirmBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    confirmModal: {
      width: '100%',
      maxWidth: 450,
      background: '#ffffff',
      padding: isVerySmall ? '28px 22px' : '34px 30px',
      borderRadius: 28,
      textAlign: 'center',
      boxShadow: '0 25px 60px rgba(15,23,42,.20)',
      boxSizing: 'border-box',
    },

    confirmIcon: {
      width: 90,
      height: 90,
      margin: '0 auto 18px',
      background: '#fff1f2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ef4444',
    },

    confirmIconText: {
      fontSize: 36,
    },

    confirmTitle: {
      margin: '0 0 12px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      color: '#0f172a',
      fontWeight: 700,
    },

    confirmText: {
      margin: '0 0 28px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.7,
    },

    confirmActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 14,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    confirmButton: {
      minWidth: isVerySmall ? '100%' : 120,
      border: 'none',
      borderRadius: 14,
      padding: '13px 22px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: 14,
      transition: '.25s',
    },

    confirmCancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },

    confirmDeleteBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },
  };
};

export default createDentistViewProfileStyles;