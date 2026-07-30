const createRecepProfileStyles = ({
  isMobile = false,
  isTablet = false,
  isSmallScreen = false,
} = {}) => {
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

    mainContainer: {
      minHeight: '100vh',
      width: '100%',
      maxWidth: 'none',
      margin: 0,
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    topHeader: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: isMobile ? 76 : 86,
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: isMobile ? '0 14px' : isTablet ? '0 18px' : '0 28px',
      zIndex: 150,
      boxSizing: 'border-box',
    },

    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 'none',
      background: '#d4af37',
      color: '#ffffff',
      borderRadius: 14,
      padding: isMobile ? '13px 18px' : '14px 22px',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
      boxSizing: 'border-box',
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
    },

    backButtonIcon: {
      fontSize: 16,
    },

    backButtonText: {
      fontSize: 14,
      lineHeight: 1,
    },

    mainContent: {
      padding: isMobile
        ? '96px 14px 18px'
        : isTablet
          ? '106px 24px 24px'
          : '110px 28px 28px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: 'none',
      margin: 0,
      overflowX: 'hidden',
    },

    heroCard: {
      position: 'relative',
      width: '100%',
      minHeight: isMobile ? 'auto' : 190,
      borderRadius: isMobile ? 22 : isTablet ? 24 : 28,
      background: 'linear-gradient(135deg, #b8860b, #f4c430, #ffe08a)',
      padding: isMobile ? 20 : isTablet ? 22 : isSmallScreen ? 26 : 30,
      marginBottom: 22,
      overflow: 'hidden',
      display: 'flex',
      alignItems: isSmallScreen ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      gap: isTablet ? 18 : 24,
      flexDirection: isSmallScreen ? 'column' : 'row',
      boxSizing: 'border-box',
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
      width: '100%',
      boxSizing: 'border-box',
    },

    heroBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: isMobile ? '5px 12px' : '6px 14px',
      borderRadius: 50,
      background: 'rgba(255, 255, 255, 0.16)',
      color: '#ffffff',
      fontSize: isMobile ? 11 : 12,
      fontWeight: 600,
      marginBottom: 16,
    },

    heroTitle: {
      maxWidth: 760,
      fontSize: isMobile ? 20 : isTablet ? 24 : isSmallScreen ? 28 : 31,
      color: '#ffffff',
      marginBottom: 12,
      marginTop: 0,
      lineHeight: isSmallScreen ? 1.4 : 1.2,
      fontFamily: 'Arial, sans-serif',
    },

    heroText: {
      marginTop: 10,
      color: '#ffffff',
      fontSize: isMobile ? 12 : 14,
      lineHeight: isSmallScreen ? 1.6 : 1.5,
      marginBottom: 0,
      fontFamily: 'Arial, sans-serif',
    },

    heroIcon: {
      width: isSmallScreen ? 78 : 90,
      height: isSmallScreen ? 78 : 90,
      minWidth: isSmallScreen ? 78 : 90,
      borderRadius: 24,
      background: 'rgba(255, 255, 255, 0.18)',
      display: isTablet || isMobile ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    heroIconText: {
      fontSize: isSmallScreen ? 36 : 42,
      color: '#ffffff',
      verticalAlign: 'middle',
    },

    profileHeader: {
      background: '#ffffff',
      border: '1px solid #edf0f5',
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 18 : 24,
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? 18 : 16,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      marginBottom: 24,
      boxSizing: 'border-box',
      width: '100%',
    },

    profileLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
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
      fontSize: isMobile ? 22 : 28,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    profileSubtext: {
      marginTop: 6,
      marginBottom: 0,
      color: '#64748b',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
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
      boxShadow: '0 10px 22px rgba(139, 101, 8, 0.18)',
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
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 18 : 24,
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
      boxSizing: 'border-box',
      minWidth: 0,
      width: '100%',
      overflow: 'hidden',
    },

    fullCard: {
      gridColumn: isSmallScreen ? 'span 1' : '1 / 3',
    },

    personalInfoCard: {
      width: '100%',
    },

    cardTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      paddingBottom: 16,
      borderBottom: '1px solid #e2e8f0',
    },

    cardTitleIcon: {
      width: 42,
      height: 42,
      background: '#fff8e1',
      color: '#b8860b',
      borderRadius: 14,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 19,
      flexShrink: 0,
    },

    cardTitleText: {
      fontSize: isMobile ? 18 : 20,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
    },

    personalInfoGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      gap: isMobile ? 12 : 16,
      minWidth: 0,
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
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      padding: 16,
      boxSizing: 'border-box',
      minHeight: 74,
    },

    infoItemFull: {
      gridColumn: isMobile ? 'span 1' : '1 / 3',
    },

    infoItemWide: {
      gridColumn: isMobile
        ? 'span 1'
        : isSmallScreen
          ? 'span 1'
          : 'span 2',
    },

    infoLabel: {
      display: 'block',
      color: '#64748b',
      fontSize: 13,
      marginBottom: 7,
      fontFamily: 'Arial, sans-serif',
    },

    infoValue: {
      color: '#0f172a',
      fontSize: 15,
      fontWeight: 700,
      lineHeight: 1.4,
      fontFamily: 'Arial, sans-serif',
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
      padding: isMobile ? '20px 18px' : '22px 24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    editModalTitle: {
      fontSize: isMobile ? 19 : 22,
      color: '#0f172a',
      margin: 0,
      fontFamily: 'Arial, sans-serif',
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
      padding: isMobile ? 18 : 24,
    },

    formGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: 16,
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
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
    },

    formInputInvalid: {
      borderColor: '#dc2626',
      background: '#fff1f2',
    },

    formTextarea: {
      minHeight: 90,
      resize: 'vertical',
    },

    editModalActions: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 24,
      flexDirection: isMobile ? 'column' : 'row',
    },

    saveBtn: {
      border: 'none',
      padding: '13px 18px',
      borderRadius: 14,
      fontSize: 14,
      cursor: 'pointer',
      background: '#d4af37',
      color: '#ffffff',
      width: isMobile ? '100%' : 'auto',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 800,
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
      fontSize: 28,
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
      border: 'none',
      borderRadius: 12,
      cursor: 'pointer',
      fontSize: 14,
      fontFamily: '"Inter Bold", Arial, sans-serif',
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
      color: '#8b6508',
      fontSize: 15,
      fontWeight: 800,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentsHint: {
      margin: '3px 0 0',
      color: '#64748b',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentDropzone: {
      border: '1px dashed #d4af37',
      background: '#fff8df',
      borderRadius: 14,
      padding: isMobile ? '18px 14px' : '22px 18px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: '#8b6508',
      cursor: 'pointer',
      textAlign: 'center',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
    },

    attachmentUploadIcon: {
      fontSize: 24,
      marginBottom: 2,
    },

    attachmentEmpty: {
      marginTop: 12,
      background: '#f8fafc',
      border: '1px dashed #dbe3ef',
      color: '#64748b',
      padding: 14,
      borderRadius: 14,
      fontSize: 13,
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
    },

    attachmentList: {
      display: 'grid',
      gap: 10,
      marginTop: 12,
      maxHeight: 356,
      overflowY: 'auto',
      paddingRight: 4,
    },

    attachmentItem: {
      display: 'grid',
      gridTemplateColumns: '44px minmax(0, 1fr) 38px 38px',
      alignItems: 'center',
      gap: 10,
      border: '1px solid #f3d879',
      background: '#fffdf7',
      borderRadius: 14,
      padding: '10px 12px',
      boxSizing: 'border-box',
      minWidth: 0,
    },

    attachmentFileIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: '#fff8df',
      color: '#b8860b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      flexShrink: 0,
    },

    attachmentInfo: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },

    attachmentName: {
      color: '#0f172a',
      fontSize: 14,
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    attachmentMeta: {
      color: '#64748b',
      fontSize: 12,
      marginTop: 3,
      fontFamily: 'Arial, sans-serif',
    },

    attachmentActionBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      border: '1px solid #f3d879',
      background: '#fff8df',
      color: '#b8860b',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      cursor: 'pointer',
      fontSize: 15,
      boxSizing: 'border-box',
    },

    attachmentDeleteBtn: {
      background: '#fee2e2',
      borderColor: '#fecaca',
      color: '#dc2626',
    },

    receptProfile: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      minHeight: 60,
      padding: isMobile ? 10 : '10px 20px',
      borderRadius: 16,
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
    },
  };
};

export default createRecepProfileStyles;
