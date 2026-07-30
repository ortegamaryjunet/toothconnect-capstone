const createRecepPatientProfileStyles = ({
  isMobile = false,
  isSmallScreen = false,
  isVerySmall = false,
} = {}) => {
  const topHeaderHeight = 64;
  const sidebarWidth = isVerySmall ? 70 : isMobile ? 80 : 250;
  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff8df';
  const primaryBorder = '#f3d879';

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
      gap: 18,
      padding: isVerySmall ? '0 14px' : '0 22px',
      zIndex: 1000,
      boxSizing: 'border-box',
    },

    topHeaderTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 17 : 20,
      color: '#172554',
      lineHeight: 1.2,
    },

    backBtn: {
      minWidth: 72,
      height: 42,
      padding: '0 16px',
      border: '1px solid #d4af37',
      borderRadius: 12,
      background: '#d4af37',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: 14,
      fontWeight: 700,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    sidebar: {
      position: 'fixed',
      top: topHeaderHeight,
      left: 0,
      bottom: 0,
      width: sidebarWidth,
      background: '#ffffff',
      borderRight: '1px solid #dbeafe',
      padding: isMobile ? '18px 10px' : '18px 14px',
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    menuItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'center' : 'flex-start',
      gap: 12,
      fontSize: 15,
      padding: isMobile ? '14px 10px' : '14px 15px',
      marginBottom: 10,
      borderRadius: 14,
      cursor: 'pointer',
      color: '#475569',
      transition: '0.2s ease',
      border: 'none',
      background: 'transparent',
      textAlign: 'left',
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
    },

    menuItemActive: {
      background: 'linear-gradient(135deg, #8b6508, #d4af37)',
      color: '#ffffff',
      fontWeight: 600,
      boxShadow: '0 8px 18px rgba(139, 101, 8, 0.22)',
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

    contentSection: {
      minHeight: '100%',
    },

    profileBanner: {
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      color: '#ffffff',
      padding: isVerySmall ? '20px 22px' : '24px 28px',
      borderRadius: 18,
      marginBottom: 22,
      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.18)',
    },

    sectionHeader: {
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      color: '#ffffff',
      padding: isVerySmall ? '20px 22px' : '24px 28px',
      borderRadius: 18,
      marginBottom: 22,
      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.18)',
    },

    bannerTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 21 : 24,
    },

    bannerText: {
      margin: '7px 0 0',
      fontSize: 14,
      color: '#dbeafe',
      lineHeight: 1.5,
    },

    patientMainCard: {
      background: '#ffffff',
      border: '1px solid #d7e6ff',
      borderRadius: 18,
      padding: isVerySmall ? 18 : 24,
      marginBottom: 20,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 18,
      boxSizing: 'border-box',
    },

    patientAvatar: {
      width: isVerySmall ? 66 : 78,
      height: isVerySmall ? 66 : 78,
      borderRadius: 18,
      background: '#fff3c4',
      color: '#d4af37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isVerySmall ? 30 : 36,
      flexShrink: 0,
    },

    patientName: {
      margin: '0 0 6px',
      fontSize: isVerySmall ? 20 : 24,
      color: '#071b5f',
    },

    patientId: {
      margin: 0,
      color: '#41609b',
      fontSize: 14,
    },

    infoCard: {
      background: '#ffffff',
      border: '1px solid #d7e6ff',
      borderRadius: 18,
      padding: isVerySmall ? 18 : 24,
      marginBottom: 20,
      boxSizing: 'border-box',
    },

    cardTitle: {
      marginBottom: 18,
    },

    cardTitleText: {
      margin: 0,
      fontSize: 18,
      color: '#071b5f',
      textTransform: 'uppercase',
    },

    subsectionTitle: {
      margin: '18px 0 12px',
      fontSize: 13,
      color: '#2563eb',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)',
      gap: 16,
    },

    infoItem: {
      background: '#ffffff',
      border: '1px solid #d7e6ff',
      borderRadius: 14,
      padding: 18,
      minHeight: 78,
      boxSizing: 'border-box',
    },

    infoItemFull: {
      gridColumn: isSmallScreen ? 'span 1' : 'span 3',
    },

    infoItemLabel: {
      display: 'block',
      fontSize: 13,
      color: '#406292',
      marginBottom: 8,
    },

    infoItemValue: {
      fontSize: 15,
      color: '#00185c',
      wordBreak: 'break-word',
    },

    conditionList: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)',
      gap: 12,
    },

    conditionChip: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: '#f8fbff',
      border: '1px solid #d7e6ff',
      borderRadius: 12,
      padding: '12px 14px',
      fontSize: 14,
      color: '#071b5f',
    },

    emptyText: {
      background: '#f8fbff',
      border: '1px solid #d7e6ff',
      borderRadius: 12,
      padding: 16,
      color: '#64748b',
      margin: 0,
    },

    balanceCard: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(4, 1fr)',
      gap: 16,
      marginBottom: 18,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #dbeafe',
      borderRadius: 20,
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
    },

    summaryIcon: {
      width: 48,
      height: 48,
      background: '#dbeafe',
      color: '#2563eb',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      flexShrink: 0,
    },

    summaryText: {
      minWidth: 0,
    },

    summaryLabel: {
      margin: '0 0 6px',
      fontSize: 13,
      color: '#64748b',
      fontWeight: 500,
    },

    summaryValue: {
      margin: 0,
      color: '#172554',
      fontSize: 21,
      fontWeight: 700,
    },

    paymentActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 16,
    },

    filters: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      width: isVerySmall ? '100%' : 'auto',
    },

    filterSelect: {
      height: 42,
      padding: '0 14px',
      borderRadius: 12,
      border: '1px solid #bfdbfe',
      background: '#ffffff',
      color: '#172554',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      width: isVerySmall ? '100%' : 'auto',
      boxSizing: 'border-box',
    },

    paymentTableContainer: {
      background: '#ffffff',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 20,
      padding: 16,
      overflowX: 'auto',
      boxSizing: 'border-box',
    },

    paymentTable: {
      width: '100%',
      borderCollapse: 'collapse',
      minWidth: 1180,
    },

    th: {
      padding: '14px 16px',
      textAlign: 'left',
      borderBottom: '1px solid #e5e7eb',
      fontSize: 14,
      background: primarySoft,
      color: primaryDark,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    td: {
      padding: '14px 16px',
      textAlign: 'left',
      borderBottom: '1px solid #e5e7eb',
      fontSize: 14,
      whiteSpace: 'nowrap',
      color: '#172554',
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

    noDataCell: {
      textAlign: 'center',
      color: '#64748b',
      fontWeight: 600,
      padding: 24,
    },

    paymentStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 9px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },

    paymentStatusPaid: {
      background: '#dcfce7',
      color: '#166534',
    },

    paymentStatusPartial: {
      background: '#fef3c7',
      color: '#92400e',
    },

    paymentStatusPending: {
      background: '#e0f2fe',
      color: '#075985',
    },

    paymentStatusFailed: {
      background: '#fee2e2',
      color: '#991b1b',
    },

    paymentStatusRefunded: {
      background: '#ede9fe',
      color: '#5b21b6',
    },

    paymentStatusUnpaid: {
      background: '#f1f5f9',
      color: '#475569',
    },

    pagination: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 12,
      marginTop: 16,
    },

    pageBtn: {
      minWidth: 74,
      height: 34,
      padding: '0 14px',
      borderRadius: 10,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    pageBtnDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },

    pageInfo: {
      fontSize: 14,
      color: '#475569',
      minWidth: 90,
      textAlign: 'center',
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
      padding: isVerySmall ? 18 : 22,
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
      padding: isVerySmall ? 18 : 22,
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
      maxHeight: isVerySmall ? '50vh' : '56vh',
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

    scheduleGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
      gap: 22,
    },

    scheduleColumn: {
      background: '#ffffff',
      border: '1px solid #dbeafe',
      borderRadius: 20,
      padding: 18,
      boxSizing: 'border-box',
    },

    simpleTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: '#172554',
      marginBottom: 14,
      textTransform: 'uppercase',
    },

    scheduleCard: {
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      background: '#f8fbff',
      border: '1px solid #dbeafe',
      boxSizing: 'border-box',
    },

    scheduleCardUpcoming: {
      borderLeft: '5px solid #2563eb',
    },

    scheduleCardPast: {
      borderLeft: '5px solid #64748b',
    },

    scheduleBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    },

    scheduleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 15,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    scheduleLabel: {
      fontSize: 12,
      color: '#64748b',
    },

    scheduleValue: {
      fontSize: 14,
      color: '#172554',
      fontWeight: 600,
    },

    scheduleStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 9px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      width: 'fit-content',
    },

    scheduleStatusCompleted: {
      background: '#dcfce7',
      color: '#166534',
    },

    scheduleStatusCancelled: {
      background: '#fee2e2',
      color: '#991b1b',
    },

    scheduleStatusNoShow: {
      background: '#fee2e2',
      color: '#991b1b',
    },

    scheduleStatusScheduled: {
      background: '#dbeafe',
      color: '#1d4ed8',
    },

    scheduleStatusRescheduled: {
      background: '#fef3c7',
      color: '#92400e',
    },

    noDataBox: {
      textAlign: 'center',
      color: '#64748b',
      fontWeight: 600,
      padding: 24,
      background: '#f8fbff',
      border: '1px solid #dbeafe',
      borderRadius: 14,
    },

    modal: {
      display: 'flex',
      position: 'fixed',
      zIndex: 9999,
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      alignItems: 'center',
      padding: 18,
      boxSizing: 'border-box',
    },

    backModalContent: {
      width: '100%',
      maxWidth: 410,
      background: '#ffffff',
      padding: isVerySmall ? '26px 20px' : '30px 25px',
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
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    backModalButton: {
      minWidth: isVerySmall ? '100%' : 100,
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
      padding: isVerySmall ? '26px 20px' : '30px 25px',
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
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    confirmButton: {
      minWidth: isVerySmall ? '100%' : 100,
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

export default createRecepPatientProfileStyles;
