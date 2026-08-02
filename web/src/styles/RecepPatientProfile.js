const createRecepPatientProfileStyles = ({
  isMobile = false,
  isSmallScreen = false,
  isVerySmall = false,
} = {}) => {
  const topHeaderHeight = 70;
  const sidebarWidth = isVerySmall ? 72 : isMobile ? 84 : 260;

  const primary = '#d4af37';
  const primaryDark = '#8b6508';
  const primarySoft = '#fff9e8';
  const primaryBorder = '#f2dd92';

  return {
    page: {
      minHeight: '100vh',
      width: '100%',
      background: '#f5f7fb',
      fontFamily: 'Arial, sans-serif',
      color: '#1e293b',
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
      padding: isVerySmall ? '0 16px' : '0 28px',
      boxShadow: '0 10px 30px rgba(15,23,42,.05)',
      zIndex: 1000,
      boxSizing: 'border-box',
    },

    topHeaderTitle: {
      margin: 0,
      fontFamily: '"Inter Bold", Arial, sans-serif',
      fontSize: isVerySmall ? 18 : 24,
      color: '#0f172a',
      lineHeight: 1.2,
      fontWeight: 700,
    },

    backBtn: {
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
      gap: 14,
      fontSize: 15,
      fontWeight: 600,
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

    menuItemIcon: {
      marginRight: isMobile ? 0 : 10,
      fontSize: 19,
      verticalAlign: 'middle',
    },

    menuItemText: {
      display: isMobile ? 'none' : 'inline',
      fontSize: 15,
    },

    menuItemActive: {
      background: 'linear-gradient(135deg,#8b6508,#d4af37)',
      color: '#ffffff',
      fontWeight: 700,
      boxShadow: '0 12px 24px rgba(212,175,55,.28)',
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
      padding: isMobile ? 18 : 32,
      boxSizing: 'border-box',
    },

    contentSection: {
      minHeight: '100%',
    },

    profileBanner: {
      background: 'linear-gradient(135deg,#8b6508,#d4af37,#ffe79d)',
      color: '#ffffff',
      padding: isVerySmall ? '24px' : '32px',
      borderRadius: 24,
      marginBottom: 26,
      boxShadow: '0 20px 40px rgba(212,175,55,.25)',
      overflow: 'hidden',
      position: 'relative',
    },

    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#ffffff',
      borderRadius: 24,
      padding: isVerySmall ? '20px' : '24px 30px',
      marginBottom: 24,
      border: '1px solid #e5e7eb',
      borderLeft: '6px solid #d4af37',
      boxShadow: '0 10px 30px rgba(15,23,42,.05)',
    },

    bannerTitle: {
      margin: 0,
      fontSize: isVerySmall ? 24 : 30,
      fontWeight: 700,
      color: '#0f172a',
    },

    bannerText: {
      marginTop: 8,
      fontSize: 14,
      color: '#64748b',
      lineHeight: 1.6,
    },

    patientMainCard: {
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
      boxShadow: '0 10px 25px rgba(212,175,55,.2)',
    },

    patientName: {
      margin: '0 0 8px',
      fontSize: isVerySmall ? 22 : 30,
      color: '#0f172a',
      fontWeight: 700,
    },

    patientId: {
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

    cardTitle: {
      marginBottom: 22,
    },

    cardTitleText: {
      margin: 0,
      fontSize: 22,
      color: '#0f172a',
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '.5px',
    },

    subsectionTitle: {
      margin: '20px 0 14px',
      fontSize: 13,
      color: primaryDark,
      fontWeight: 700,
      textTransform: 'uppercase',
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'repeat(auto-fit, minmax(240px,1fr))',
      gap: 18,
    },

    infoItem: {
      background: '#fbfcff',
      border: '1px solid #edf2f7',
      borderRadius: 18,
      padding: 20,
      minHeight: 90,
      boxSizing: 'border-box',
      transition: '.25s',
      boxShadow: '0 6px 18px rgba(15,23,42,.03)',
    },

    infoItemFull: {
      gridColumn: isSmallScreen ? 'span 1' : 'span 3',
    },

    infoItemLabel: {
      display: 'block',
      fontSize: 12,
      color: '#64748b',
      marginBottom: 8,
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '.4px',
    },

    infoItemValue: {
      fontSize: 16,
      color: '#0f172a',
      fontWeight: 600,
      wordBreak: 'break-word',
      lineHeight: 1.6,
    },

    conditionList: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'repeat(auto-fit, minmax(220px,1fr))',
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

    emptyText: {
      background: '#fbfcff',
      border: '1px dashed #dbeafe',
      borderRadius: 18,
      padding: 20,
      color: '#64748b',
      margin: 0,
      textAlign: 'center',
      fontSize: 14,
      lineHeight: 1.6,
    },

    balanceCard: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'repeat(auto-fit, minmax(230px,1fr))',
      gap: 20,
      marginBottom: 24,
    },

    summaryCard: {
      background: '#ffffff',
      border: '1px solid #edf2f7',
      borderRadius: 22,
      padding: 22,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      boxShadow: '0 12px 30px rgba(15,23,42,.05)',
      boxSizing: 'border-box',
      transition: '.25s',
    },

    summaryIcon: {
      width: 58,
      height: 58,
      background: '#fff8e1',
      color: '#b8860b',
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      flexShrink: 0,
    },

    summaryText: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },

    summaryLabel: {
      margin: 0,
      fontSize: 13,
      color: '#64748b',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '.4px',
    },

    summaryValue: {
      margin: 0,
      color: '#0f172a',
      fontSize: 26,
      fontWeight: 700,
    },

    paymentActions: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 14,
      flexWrap: 'wrap',
      marginBottom: 20,
      padding: '18px 20px',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 20,
    },

    filters: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 12,
      flexWrap: 'wrap',
      width: 'auto',
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

    paymentTableContainer: {
      background: '#ffffff',
      border: '1px solid #dbe4f0',
      borderRadius: 22,
      boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
      overflow: 'hidden',
      marginTop: 18,
      marginBottom: 24,
    },

    paymentTable: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      minWidth: 1100,
    },

    th: {
      padding: '18px 20px',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      color: '#334155',
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '.5px',
      whiteSpace: 'nowrap',
    },

    td: {
      padding: '18px 20px',
      borderBottom: '1px solid #eef2f7',
      color: '#334155',
      fontSize: 14,
      whiteSpace: 'nowrap',
      background: '#ffffff',
    },

    historyNoteWrap: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8,
      maxWidth: 260,
      whiteSpace: 'normal',
      lineHeight: 1.6,
    },

    rescheduleTag: {
      border: `1px solid ${primaryBorder}`,
      borderRadius: 999,
      background: primarySoft,
      color: primaryDark,
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    noDataCell: {
      padding: '90px 20px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: 15,
      fontWeight: 500,
      background: '#ffffff',
    },

    paymentStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '7px 12px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      letterSpacing: '.3px',
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
      background: '#dbeafe',
      color: '#1d4ed8',
    },

    paymentStatusFailed: {
      background: '#fee2e2',
      color: '#991b1b',
    },

    paymentStatusRefunded: {
      background: '#ede9fe',
      color: '#6d28d9',
    },

    paymentStatusUnpaid: {
      background: '#f1f5f9',
      color: '#475569',
    },

    pagination: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 16,
      padding: '18px 22px',
    },

    pageBtn: {
      minWidth: 90,
      height: 40,
      borderRadius: 10,
      border: '1px solid #cbd5e1',
      background: '#ffffff',
      color: '#334155',
      cursor: 'pointer',
      fontWeight: 600,
      transition: '0.2s',
    },

    pageBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    pageInfo: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: 600,
    },

    attachmentStrip: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 38,
      flexWrap: 'wrap',
    },

    attachmentThumbBtn: {
      width: 40,
      height: 40,
      padding: 0,
      border: `1px solid ${primaryBorder}`,
      borderRadius: 12,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: '0 5px 15px rgba(15,23,42,.05)',
      transition: '.25s',
    },

    attachmentThumbImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: 12,
    },

    attachmentFileIcon: {
      fontSize: 18,
    },

    attachmentMore: {
      minWidth: 30,
      height: 30,
      padding: '0 8px',
      borderRadius: 999,
      background: primary,
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentEmptyText: {
      color: '#94a3b8',
      fontSize: 13,
      fontStyle: 'italic',
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentBtn: {
      minWidth: 145,
      height: 40,
      padding: '0 14px',
      borderRadius: 14,
      border: `1px solid ${primaryBorder}`,
      background: primarySoft,
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      transition: '.25s',
    },

    historyAttachmentBtnDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    historyAttachmentCount: {
      minWidth: 24,
      height: 24,
      borderRadius: '50%',
      background: primary,
      color: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
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
      maxWidth: 560,
      maxHeight: 'calc(100vh - 80px)',
      background: '#ffffff',
      borderRadius: 24,
      padding: isVerySmall ? 20 : 28,
      boxSizing: 'border-box',
      border: `1px solid ${primaryBorder}`,
      overflow: 'hidden',
      boxShadow: '0 25px 60px rgba(15,23,42,.20)',
    },

    rescheduleDetails: {
      margin: '18px 0 0',
      padding: 18,
      borderRadius: 16,
      border: `1px solid ${primaryBorder}`,
      background: '#fffdf7',
      color: '#475569',
      fontSize: 14,
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
      maxHeight: '54vh',
      overflowY: 'auto',
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 18,
      paddingRight: 42,
      marginBottom: 20,
    },

    historyAttachmentMeta: {
      margin: '8px 0 0',
      color: '#64748b',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    historyAttachmentList: {
      display: 'grid',
      gap: 14,
      maxHeight: isVerySmall ? '50vh' : '58vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: 6,
      minHeight: 0,
    },

    historyAttachmentItem: {
      display: 'grid',
      gridTemplateColumns: '56px 1fr 42px',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 18,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      boxSizing: 'border-box',
      boxShadow: '0 6px 18px rgba(15,23,42,.05)',
    },

    historyAttachmentThumb: {
      width: 56,
      height: 56,
      borderRadius: 14,
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
      gap: 5,
    },

    historyAttachmentName: {
      color: '#0f172a',
      fontSize: 14,
      fontWeight: 700,
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
      width: 40,
      height: 40,
      borderRadius: 12,
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      transition: '.25s',
    },

    historyAttachmentEmpty: {
      padding: 24,
      borderRadius: 18,
      border: `2px dashed ${primaryBorder}`,
      background: primarySoft,
      color: primaryDark,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentCloseBtn: {
      position: 'absolute',
      top: 16,
      right: 16,
      width: 38,
      height: 38,
      borderRadius: '50%',
      border: `1px solid ${primaryBorder}`,
      background: '#ffffff',
      color: primaryDark,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      transition: '.25s',
      boxShadow: '0 8px 20px rgba(15,23,42,.08)',
    },

    attachmentPreviewTitle: {
      margin: '0 50px 18px 0',
      fontSize: 20,
      fontWeight: 700,
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: '.3px',
    },

    attachmentPreviewImage: {
      width: '100%',
      maxHeight: '74vh',
      objectFit: 'contain',
      borderRadius: 18,
      background: '#f8fafc',
      border: `1px solid ${primaryBorder}`,
    },

    attachmentPreviewFrame: {
      width: '100%',
      height: '74vh',
      border: `1px solid ${primaryBorder}`,
      borderRadius: 18,
      background: '#ffffff',
      overflow: 'hidden',
    },

    scheduleGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen
        ? '1fr'
        : 'repeat(auto-fit, minmax(340px,1fr))',
      gap: 24,
    },

    scheduleColumn: {
      background: '#ffffff',
      border: '1px solid #edf2f7',
      borderRadius: 24,
      padding: 24,
      boxSizing: 'border-box',
      boxShadow: '0 12px 30px rgba(15,23,42,.05)',
    },

    simpleTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: '#0f172a',
      marginBottom: 18,
      textTransform: 'uppercase',
      letterSpacing: '.5px',
    },

    scheduleCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      background: '#fbfcff',
      border: '1px solid #edf2f7',
      boxSizing: 'border-box',
      boxShadow: '0 6px 18px rgba(15,23,42,.04)',
    },

    scheduleCardUpcoming: {
      borderLeft: `5px solid ${primary}`,
    },

    scheduleCardPast: {
      borderLeft: '5px solid #94a3b8',
    },

    scheduleBlock: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    scheduleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 18,
      flexDirection: isVerySmall ? 'column' : 'row',
    },

    scheduleLabel: {
      fontSize: 12,
      color: '#64748b',
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '.4px',
    },

    scheduleValue: {
      fontSize: 15,
      color: '#0f172a',
      fontWeight: 600,
    },

    scheduleStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '7px 14px',
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      width: 'fit-content',
      textTransform: 'uppercase',
      letterSpacing: '.3px',
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
      padding: 28,
      background: '#fbfcff',
      border: '2px dashed #dbeafe',
      borderRadius: 18,
      lineHeight: 1.6,
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
      background: '#e2e8f0',
      color: '#0f172a',
    },

    confirmDeleteBtn: {
      background: '#dc2626',
      color: '#ffffff',
    },
  };
};

export default createRecepPatientProfileStyles;