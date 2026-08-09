const createDentistProfileStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
  const sidebarWidth = isMobile ? 74 : isTablet ? 88 : 230;

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

    logoutSection: {
      marginTop: 'auto',
      paddingTop: isMobile || isTablet ? 14 : 18,
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

    avatarSmall: {
      width: 40,
      height: 40,
      borderRadius: 13,
      background: '#d4af37',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
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

    errorBanner: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 16,
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      lineHeight: 1.45,
      wordBreak: 'break-word',
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

    profileHeader: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : isTablet ? 20 : 24,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: isMobile ? 16 : 18,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      marginBottom: isMobile ? 18 : 24,
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      overflow: 'hidden',
    },

    profileLeft: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: 16,
      width: isSmallScreen ? '100%' : 'auto',
      minWidth: 0,
    },

    profileAvatar: {
      width: isMobile ? 60 : 72,
      height: isMobile ? 60 : 72,
      borderRadius: isMobile ? 18 : 20,
      background: 'linear-gradient(135deg, #b8860b, #d4af37)',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? 22 : 24,
      fontWeight: 700,
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 10px 24px rgba(212, 175, 55, 0.35)',
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
      fontSize: isMobile ? 22 : 24,
      fontWeight: 700,
      flexShrink: 0,
      fontFamily: 'Arial, sans-serif',
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

    profileName: {
      fontSize: isMobile ? 22 : isTablet ? 25 : 28,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.2,
      wordBreak: 'break-word',
    },

    profileSubtext: {
      marginTop: 6,
      marginBottom: 0,
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
      wordBreak: 'break-word',
    },

    profileActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isSmallScreen ? 'stretch' : 'flex-end',
      gap: 10,
      width: isSmallScreen ? '100%' : 'auto',
      flexDirection: isMobile ? 'column' : 'row',
      flexWrap: isMobile ? 'nowrap' : 'wrap',
    },

    editBtn: {
      border: 'none',
      background: '#d4af37',
      color: '#ffffff',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      fontWeight: 800,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    pdfBtn: {
      border: 'none',
      background: 'linear-gradient(135deg, #f87171, #dc2626)',
      color: '#ffffff',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 8px 18px rgba(220, 38, 38, 0.24)',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },

    pdfBtnIcon: {
      fontSize: 14,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    disabledBtn: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },

    profileGrid: {
      display: 'grid',
      gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr',
      gap: isMobile ? 16 : 24,
      width: '100%',
      minWidth: 0,
    },

    card: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 18 : 22,
      padding: isMobile ? 16 : isTablet ? 20 : 24,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      minWidth: 0,
      overflow: 'hidden',
    },

    fullCard: {
      gridColumn: isSmallScreen ? 'span 1' : '1 / 3',
    },

    cardTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: isMobile ? 16 : 20,
      paddingBottom: isMobile ? 14 : 16,
      borderBottom: '1px solid #edf0f5',
      minWidth: 0,
    },

    cardTitleIcon: {
      width: isMobile ? 38 : 42,
      height: isMobile ? 38 : 42,
      background: '#fff8e1',
      color: '#b8860b',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? 17 : 19,
      flexShrink: 0,
    },

    cardTitleText: {
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.25,
      wordBreak: 'break-word',
      fontWeight: 800,
    },

    infoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? 12 : 16,
      minWidth: 0,
    },

    infoGridFour: {
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '1fr'
        : isSmallScreen
          ? 'repeat(2, minmax(0, 1fr))'
          : 'repeat(4, minmax(0, 1fr))',
      gap: isMobile ? 12 : 16,
      minWidth: 0,
    },

    infoItem: {
      background: '#ffffff',
      border: '1px solid #dbe3ef',
      borderRadius: 14,
      padding: isMobile ? 14 : 16,
      boxSizing: 'border-box',
      minWidth: 0,
      overflow: 'hidden',
    },

    infoItemFull: {
      gridColumn: isMobile ? 'span 1' : '1 / 3',
    },

    infoLabel: {
      display: 'block',
      color: '#64748b',
      fontSize: 13,
      marginBottom: 7,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.3,
    },

    infoValue: {
      color: '#172033',
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
      wordBreak: 'break-word',
    },

    subTitle: {
      margin: '24px 0 12px',
      fontSize: 15,
      fontWeight: 800,
      color: '#8b6508',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.3,
    },

    emptyBox: {
      background: '#f8fafc',
      border: '1px dashed #dbe3ef',
      color: '#64748b',
      padding: 18,
      borderRadius: 16,
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.5,
      boxSizing: 'border-box',
    },

    addWorkBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 13,
      padding: '10px 15px',
      borderRadius: 11,
      border: 'none',
      background: 'linear-gradient(135deg, #b8860b, #d4af37)',
      color: '#ffffff',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      boxShadow: '0 8px 18px rgba(139, 101, 8, 0.18)',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      flexShrink: 0,
    },

    attachmentsBlock: {
      marginTop: 22,
      borderTop: '1px solid #edf0f5',
      paddingTop: 18,
    },

    attachmentsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 12,
    },

    attachmentsTitle: {
      margin: 0,
      color: '#172033',
      fontSize: 16,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
      letterSpacing: '-0.1px',
    },

    attachmentsHint: {
      margin: '4px 0 10px',
      color: '#64748b',
      fontSize: 13,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
      fontWeight: 500,
    },

    attachmentDropzone: {
      border: '1px dashed #d4af37',
      backgroundColor: '#fffdf5',
      borderRadius: 12,
      padding: isMobile ? '16px 14px' : '20px 18px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      color: '#8b6508',
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
      boxSizing: 'border-box',
      minHeight: isMobile ? 100 : 115,
      transition: '0.2s ease',
    },

    attachmentUploadIcon: {
      fontSize: 24,
      marginBottom: 2,
    },

    attachmentEmpty: {
      marginTop: 12,
      minHeight: 130,
      padding: '24px 18px',
      border: '1px dashed #dbe3ef',
      borderRadius: 14,
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      boxSizing: 'border-box',
    },

    attachmentEmptyIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 17,
      marginBottom: 10,
    },

    attachmentEmptyTitle: {
      color: '#334155',
      fontSize: 13,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.3,
    },

    attachmentEmptyText: {
      marginTop: 4,
      color: '#94a3b8',
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
    },

    attachmentList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 12,
      maxHeight: 356,
      overflowY: 'auto',
      paddingRight: 2,
      boxSizing: 'border-box',
    },

    attachmentItem: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: isMobile
        ? '42px minmax(0, 1fr)'
        : '46px minmax(0, 1fr) auto',
      alignItems: 'center',
      gap: 12,
      padding: isMobile ? '12px' : '13px 14px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      boxSizing: 'border-box',
      minWidth: 0,
      transition: '0.2s ease',
    },

    attachmentFileIcon: {
      width: 46,
      height: 46,
      borderRadius: 12,
      backgroundColor: '#fff8df',
      border: '1px solid #ead9a6',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      flexShrink: 0,
      boxSizing: 'border-box',
    },

    attachmentInfo: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },

    attachmentName: {
      display: 'block',
      color: '#172033',
      fontSize: 13,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.35,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    },

    attachmentMetaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
      minWidth: 0,
    },

    attachmentMeta: {
      color: '#64748b',
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.3,
    },

    attachmentDot: {
      color: '#cbd5e1',
      fontSize: 10,
    },

    attachmentType: {
      color: '#94a3b8',
      fontSize: 10,
      fontWeight: 600,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 7,
      flexShrink: 0,
      gridColumn: isMobile ? '2' : 'auto',
      marginTop: isMobile ? 8 : 0,
      width: isMobile ? '100%' : 'auto',
    },

    attachmentViewBtn: {
      height: 34,
      padding: '0 11px',
      border: '1px solid #dbe3ef',
      borderRadius: 9,
      backgroundColor: '#f8fafc',
      color: '#475569',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: 11,
      fontWeight: 700,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
    },

    attachmentDeleteBtn: {
      width: 34,
      height: 34,
      border: '1px solid #fecaca',
      borderRadius: 9,
      backgroundColor: '#fff7f7',
      color: '#dc2626',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 13,
      boxSizing: 'border-box',
      flexShrink: 0,
    },

    previousWorkSection: {
      marginTop: 26,
      paddingTop: 20,
      borderTop: '1px solid #edf0f5',
    },

    previousWorkHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 16,
    },

    previousWorkTitleGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 0,
    },

    previousWorkTitleIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      background: '#fff8df',
      border: '1px solid #ead9a6',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      flexShrink: 0,
    },

    previousWorkTitle: {
      margin: 0,
      color: '#0f172a',
      fontSize: isMobile ? 16 : 18,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.25,
    },

    previousWorkSubtitle: {
      margin: '4px 0 0',
      color: '#64748b',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.4,
    },

    previousWorkCount: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
      height: 24,
      padding: '0 8px',
      borderRadius: 999,
      background: '#fff8df',
      color: '#8b6508',
      fontSize: 11,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
      marginLeft: 8,
      verticalAlign: 'middle',
    },

    previousWorkList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: '100%',
    },

    previousWorkCard: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '42px minmax(180px, 1.2fr) minmax(190px, 1fr) minmax(180px, 1fr) 38px',
      alignItems: 'center',
      gap: 18,
      padding: '18px 20px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      boxSizing: 'border-box',
      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.035)',
    },

    previousWorkCardIcon: {
      width: 42,
      height: 42,
      borderRadius: 11,
      backgroundColor: '#fff8df',
      border: '1px solid #ead9a6',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      flexShrink: 0,
    },

    previousWorkCompanyBlock: {
      minWidth: 0,
    },

    previousWorkMain: {
        flex: 1,
        minWidth: 0,
    },

    previousWorkTop: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },

    previousWorkIcon: {
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: '#fff8df',
        border: '1px solid #ead9a6',
        color: '#b8860b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        flexShrink: 0,
    },

    previousWorkContent: {
      flex: 1,
      minWidth: 0,
    },
    
    previousWorkHeading: {
        minWidth: 0,
    },

    previousWorkNumber: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 7px',
      marginBottom: 5,
      borderRadius: 6,
      backgroundColor: '#fff8df',
      color: '#b8860b',
      fontSize: 9,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },

    previousWorkCompany: {
      margin: 0,
      color: '#172033',
      fontSize: 16,
      fontWeight: 800,
      lineHeight: 1.3,
      wordBreak: 'break-word',
    },

    previousWorkPosition: {
      margin: '4px 0 0',
      color: '#64748b',
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.4,
      wordBreak: 'break-word',
    },

    previousWorkPeriodBlock: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },

    previousWorkReasonBlock: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },

    previousWorkSectionLabel: {
      color: '#94a3b8',
      fontSize: 10,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },

    previousWorkMeta: {
      display: 'flex',
      alignItems: 'center',
    },

    previousWorkMetaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      padding: '7px 10px',
      borderRadius: 8,
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      color: '#475569',
      fontSize: 11,
      fontWeight: 700,
      whiteSpace: 'nowrap',
    },

    previousWorkMetaIcon: {
      color: '#b8860b',
      fontSize: 11,
    },

    previousWorkReasonText: {
      color: '#334155',
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.4,
      wordBreak: 'break-word',
    },

    previousWorkDeleteBtn: {
      width: 36,
      height: 36,
      border: '1px solid #fecaca',
      borderRadius: 9,
      backgroundColor: '#fff7f7',
      color: '#dc2626',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      cursor: 'pointer',
      flexShrink: 0,
      transition: '0.2s ease',
    },

    previousWorkPeriod: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 10px',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        color: '#475569',
        fontSize: 11,
        fontWeight: 700,
    },

    previousWorkReason: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        marginTop: 12,
        paddingTop: 11,
        borderTop: '1px solid #edf0f4',
    },

    previousWorkReasonLabel: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },

    previousWorkDelete: {
        width: 36,
        height: 36,
        border: '1px solid #fecaca',
        borderRadius: 9,
        backgroundColor: '#fff7f7',
        color: '#dc2626',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        cursor: 'pointer',
        flexShrink: 0,
        transition: '0.2s ease',
    },

    previousWorkReasonValue: {
        color: '#334155',
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.4,
        wordBreak: 'break-word',
    },

    previousWorkEmpty: {
      width: '100%',
      minHeight: 150,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      boxSizing: 'border-box',
      border: '1px dashed #dbe2ea',
      borderRadius: 14,
      backgroundColor: '#f8fafc',
      textAlign: 'center',
    },

    previousWorkEmptyIcon: {
      width: 42,
      height: 42,
      marginBottom: 10,
      borderRadius: 11,
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      color: '#94a3b8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
    },

    previousWorkEmptyTitle: {
      margin: 0,
      color: '#334155',
      fontSize: 14,
      fontWeight: 800,
    },

    previousWorkEmptyText: {
      margin: '5px 0 0',
      color: '#94a3b8',
      fontSize: 11,
      lineHeight: 1.4,
    },

    previousWorkEmptyBtn: {
      marginTop: 14,
      height: 36,
      padding: '0 14px',
      border: '1px solid #d4af37',
      borderRadius: 9,
      backgroundColor: '#d4af37',
      color: '#ffffff',
      fontSize: 11,
      fontWeight: 800,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },

    editOverlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? 14 : 20,
      zIndex: 9999,
      boxSizing: 'border-box',
    },

    editModalBox: {
      width: '100%',
      maxWidth: 760,
      maxHeight: '90vh',
      background: '#ffffff',
      borderRadius: isMobile ? 20 : 24,
      boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
      overflowY: 'auto',
      boxSizing: 'border-box',
    },

    editModalHeader: {
        padding: isMobile ? '18px 16px' : '20px 24px',
        borderBottom: '1px solid #edf0f5',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
    },

    editModalHeading: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minWidth: 0,
    },

    editModalIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: '#fff8df',
        border: '1px solid #ead9a6',
        color: '#b8860b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
    },

    editModalSubtitle: {
        margin: '5px 0 0',
        color: '#64748b',
        fontSize: 12,
        lineHeight: 1.4,
    },

    formSection: {
        border: '1px solid #e5e7eb',
        borderRadius: 14,
        padding: isMobile ? 14 : 16,
        marginBottom: 14,
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
    },

    formSectionHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 16,
    },

    formStep: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#fff8df',
        border: '1px solid #ead9a6',
        color: '#b8860b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 800,
        flexShrink: 0,
    },

    formSectionTitle: {
        margin: 0,
        color: '#0f172a',
        fontSize: 14,
        fontWeight: 800,
    },

    formSectionText: {
        margin: '3px 0 0',
        color: '#64748b',
        fontSize: 11,
        lineHeight: 1.4,
    },

    editModalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTop: '1px solid #edf0f5',
        flexDirection: isMobile ? 'column-reverse' : 'row',
    },

    saveBtn: {
        height: 42,
        border: '1px solid #b8860b',
        borderRadius: 10,
        background: '#b8860b',
        color: '#ffffff',
        padding: '0 18px',
        fontWeight: 500,
        cursor: 'pointer',
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? '100%' : 155,
        fontFamily: 'Arial, sans-serif',
        whiteSpace: 'nowrap',
        fontSize: 11,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        transition: '0.2s ease',
        boxSizing: 'border-box',
    },

    cancelEditBtn: {
        height: 42,
        border: '1px solid #e2e8f0',
        padding: '0 18px',
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        background: '#ffffff',
        color: '#475569',
        width: isMobile ? '100%' : 'auto',
        minWidth: isMobile ? '100%' : 100,
        fontFamily: 'Arial, sans-serif',
        whiteSpace: 'nowrap',
    },

    editModalTitle: {
      fontSize: isMobile ? 19 : 22,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.25,
    },

    workFormError: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        marginBottom: 12,
        padding: '10px 12px',
        borderRadius: 10,
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#dc2626',
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
    },

    modalClose: {
      border: 'none',
      background: '#fff8df',
      color: '#8b6508',
      width: 38,
      height: 38,
      borderRadius: 12,
      cursor: 'pointer',
      fontSize: 20,
      flexShrink: 0,
      boxShadow: '0 8px 18px rgba(139, 101, 8, 0.14)',
    },

    editForm: {
      padding: isMobile ? 16 : 24,
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: 16,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },

    formGroupFull: {
      gridColumn: isMobile ? 'span 1' : '1 / 3',
    },

    formLabel: {
      display: 'block',
      fontSize: 13,
      color: '#475569',
      marginBottom: 7,
      fontFamily: 'Arial, sans-serif',
    },

    requiredMark: {
      color: '#dc2626',
      marginLeft: 3,
      fontWeight: 800,
    },

    formInput: {
      width: '100%',
      border: '1px solid #cbd5e1',
      background: '#f8fafc',
      borderRadius: 14,
      padding: '13px 14px',
      fontSize: 14,
      outline: 'none',
      color: '#0f172a',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    formInputInvalid: {
      borderColor: '#dc2626',
      background: '#fff1f2',
    },

    phoneInputContainer: {
      width: '100%',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      zIndex: 20,
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '132px minmax(0, 1fr)',
      gap: 10,
      boxSizing: 'border-box',
    },

    phoneCountrySelect: {
      width: '100%',
      minWidth: 0,
      minHeight: 43,
      height: 43,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '0 10px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#f8fafc',
      outline: 'none',
      boxSizing: 'border-box',
    },

    phoneInput: {
      width: '100%',
      minWidth: 0,
      minHeight: 43,
      height: 43,
      border: '1px solid #cbd5e1',
      borderRadius: 12,
      padding: '0 13px',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      color: '#0f172a',
      background: '#ffffff',
      outline: 'none',
      boxSizing: 'border-box',
    },

    phoneInputError: {
      borderColor: '#dc2626',
      borderWidth: 2,
    },

    fieldErrorText: {
      color: '#dc2626',
      fontSize: 12,
      marginTop: 5,
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.35,
    },

    formTextarea: {
      minHeight: 90,
      resize: 'vertical',
    },

    editModalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 24,
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
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
      fontSize: 14,
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    cancelEditBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      cursor: 'pointer',
      background: '#e2e8f0',
      color: '#334155',
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
      whiteSpace: 'nowrap',
    },

    editErrorText: {
      margin: '0 0 16px',
      fontSize: 16,
      fontWeight: 800,
      color: '#b91c1c',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.45,
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

    confirmDetailsList: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      marginBottom: 8,
    },

    confirmDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      padding: '6px 0',
      borderBottom: '1px solid #f1f5f9',
      fontSize: 13,
      textAlign: 'left',
    },

    confirmDetailLabel: {
      color: '#64748b',
    },

    confirmDetailValue: {
      color: '#0f172a',
      textAlign: 'right',
      maxWidth: 220,
      overflowWrap: 'anywhere',
    },

    notificationBadge: {
      marginLeft: 'auto',
      background: '#dc2626',
      color: '#ffffff',
      borderRadius: 999,
      padding: '2px 7px',
      fontSize: 11,
      fontWeight: 700,
      display: isMobile || isTablet ? 'none' : 'inline-flex',
    },
  };
};

export default createDentistProfileStyles;
