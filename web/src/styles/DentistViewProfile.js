const createDentistViewProfileStyles = ({
  isMobile = false,
  isSmallScreen = false,
  isAdminView = false,
} = {}) => {
  const topHeaderHeight = isMobile ? 68 : 72;
  const sidebarWidth = isMobile ? 74 : 230;
  const primaryGradient = 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)';
  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff8df';
  const primaryBorder = '#f3d879';
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
      background: '#ffffff',
      borderBottom: '1px solid #dbeafe',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 10 : 18,
      padding: isMobile ? '0 16px' : '0 24px',
      zIndex: 1000,
      boxSizing: 'border-box',
    },

    backLink: {
      minWidth: 72,
      height: 42,
      padding: '0 16px',
      border: '1px solid #d4af37',
      borderRadius: 12,
      background: '#d4af37',
      color: '#ffffff',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 14,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
      cursor: 'pointer',
    },

    headerTitle: {
      margin: 0,
      fontSize: isMobile ? 17 : 20,
      color: '#172554',
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    sidebar: {
      position: 'fixed',
      top: topHeaderHeight,
      left: 0,
      bottom: 0,
      width: sidebarWidth,
      background: '#ffffff',
      borderRight: '1px solid #dbeafe',
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
      background: primaryGradient,
      color: '#ffffff',
      padding: isMobile ? 24 : '28px 30px',
      borderRadius: 18,
      marginBottom: 22,
      boxShadow: primaryShadow,
    },

    sectionBannerTitle: {
      margin: 0,
      fontSize: isMobile ? 21 : 24,
      color: '#ffffff',
      fontFamily: '"Inter Bold", Arial, sans-serif',
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
      border: '1px solid #d7e6ff',
      borderRadius: 18,
      padding: 24,
      marginBottom: 20,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 18,
      boxSizing: 'border-box',
    },

    patientAvatar: {
      width: 78,
      height: 78,
      borderRadius: 18,
      background: '#fff3c4',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 36,
      flexShrink: 0,
    },

    patientName: {
      margin: '0 0 6px',
      fontSize: 24,
      color: '#071b5f',
      fontFamily: '"Inter Bold", Arial, sans-serif',
    },

    patientNumber: {
      margin: 0,
      color: '#41609b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
    },

    infoCard: {
      background: '#ffffff',
      border: '1px solid #d7e6ff',
      borderRadius: 18,
      padding: 24,
      marginBottom: 20,
      boxSizing: 'border-box',
    },

    infoCardTitle: {
      margin: '0 0 18px',
      fontSize: 18,
      color: '#071b5f',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontWeight: 800,
      textTransform: 'uppercase',
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
      background: '#ffffff',
      border: '1px solid #d7e6ff',
      borderRadius: 14,
      padding: 18,
      minHeight: 78,
      boxSizing: 'border-box',
    },

    infoBoxFull: {
      gridColumn: isSmallScreen ? 'auto' : '1 / -1',
    },

    infoLabel: {
      display: 'block',
      fontSize: 13,
      color: '#406292',
      marginBottom: 8,
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      display: 'block',
      fontSize: 15,
      color: '#00185c',
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
    },

    emptyBox: {
      padding: 16,
      borderRadius: 12,
      background: '#f8fbff',
      border: '1px solid #d7e6ff',
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
      padding: '12px 14px',
      borderRadius: 12,
      background: '#f8fbff',
      border: '1px solid #d7e6ff',
      color: '#071b5f',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
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
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: '0 14px',
      background: '#ffffff',
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
      color: primaryDark,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
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
      fontSize: 13,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    historyAttachmentBtnDisabled: {
      opacity: 0.55,
      cursor: 'not-allowed',
    },

    historyAttachmentCount: {
      minWidth: 22,
      height: 22,
      borderRadius: 999,
      background: primary,
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 800,
      lineHeight: 1,
    },

    attachmentLightboxOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 18,
      boxSizing: 'border-box',
    },

    attachmentLightboxContent: {
      position: 'relative',
      width: '100%',
      maxWidth: 900,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: 18,
      padding: 18,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'auto',
    },

    historyAttachmentModal: {
      position: 'relative',
      width: '100%',
      maxWidth: 720,
      maxHeight: 'calc(100vh - 96px)',
      background: '#ffffff',
      borderRadius: 18,
      padding: isMobile ? 18 : 22,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'hidden',
      boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 16,
      fontFamily: 'Arial, sans-serif',
    },

    pageBtn: {
      minWidth: 74,
      height: 38,
      padding: '0 14px',
      borderRadius: 12,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    pageBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
      color: '#b79b41',
    },

    pageInfo: {
      fontSize: 13,
      color: primaryDark,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      zIndex: 9999,
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
      boxSizing: 'border-box',
    },

    backModalContent: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isMobile ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    backModalIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
    },

    modalIconText: {
      fontSize: 34,
    },

    backModalTitle: {
      margin: '0 0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      fontWeight: 600,
    },

    backModalText: {
      margin: '0 0 24px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.5,
    },

    backModalActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    backModalButton: {
      minWidth: isMobile ? '100%' : 100,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
    },

    backCancelBtn: {
      background: '#e5e7eb',
      color: '#0f172a',
    },

    backConfirmBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },

    confirmModal: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isMobile ? '26px 20px' : '30px 25px',
      borderRadius: 22,
      textAlign: 'center',
      boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
      boxSizing: 'border-box',
    },

    confirmIcon: {
      width: 82,
      height: 82,
      margin: '0 auto 16px',
      background: '#fee2e2',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#dc2626',
    },

    confirmIconText: {
      fontSize: 34,
    },

    confirmTitle: {
      margin: '0 0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 21,
      color: '#0f172a',
      fontWeight: 600,
    },

    confirmText: {
      margin: '0 0 24px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 15,
      color: '#64748b',
      lineHeight: 1.5,
    },

    confirmActions: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      flexDirection: isMobile ? 'column' : 'row',
    },

    confirmButton: {
      minWidth: isMobile ? '100%' : 100,
      border: 'none',
      borderRadius: 12,
      padding: '12px 18px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      fontSize: 14,
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
